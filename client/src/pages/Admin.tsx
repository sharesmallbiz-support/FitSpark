import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import VideoPlayer from "@/components/VideoPlayer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertVideoSchema } from "@shared/schema";
import type { Video, User } from "@shared/schema";
import { z } from "zod";

const videoFormSchema = insertVideoSchema.extend({
  themeCompatibility: z.array(z.string()).min(1, "Select at least one theme"),
});

type VideoForm = z.infer<typeof videoFormSchema>;

// Utility function to extract YouTube ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct ID format
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState("videos");
  const [youtubeInput, setYoutubeInput] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    if (!user?.isAdmin) {
      setLocation("/dashboard");
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos?approved=false"],
    enabled: !!user?.isAdmin,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const form = useForm<VideoForm>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      youtubeId: "",
      duration: 20,
      exerciseType: "chair-yoga",
      skillLevel: "beginner",
      effortLevel: 2,
      equipment: "none",
      themeCompatibility: ["fun"],
      description: "",
      thumbnailUrl: "",
    },
  });

  const videoMutation = useMutation({
    mutationFn: async (data: VideoForm) => {
      if (selectedVideo) {
        return apiRequest("PATCH", `/api/videos/${selectedVideo.id}`, data);
      } else {
        return apiRequest("POST", "/api/videos", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: selectedVideo ? "Video updated successfully" : "Video added successfully",
      });
      setShowVideoModal(false);
      setSelectedVideo(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    }
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ videoId, approved }: { videoId: string; approved: boolean }) => {
      return apiRequest("PATCH", `/api/videos/${videoId}`, { isApproved: approved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update video status",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId: string) => {
      return apiRequest("DELETE", `/api/videos/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setYoutubeInput(video.youtubeId); // Show the current ID in the input field
    form.reset({
      title: video.title,
      youtubeId: video.youtubeId,
      duration: video.duration,
      exerciseType: video.exerciseType,
      skillLevel: video.skillLevel,
      effortLevel: video.effortLevel,
      equipment: video.equipment,
      themeCompatibility: video.themeCompatibility,
      description: video.description || "",
      thumbnailUrl: video.thumbnailUrl || "",
    });
    setShowVideoModal(true);
  };

  const handleAddVideo = () => {
    setSelectedVideo(null);
    setYoutubeInput("");
    form.reset();
    setShowVideoModal(true);
  };

  const handleYoutubeInputChange = (value: string) => {
    setYoutubeInput(value);
    
    // Try to extract YouTube ID from the input
    const extractedId = extractYouTubeId(value);
    if (extractedId) {
      form.setValue("youtubeId", extractedId);
      
      // Also auto-generate thumbnail URL
      const thumbnailUrl = `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`;
      form.setValue("thumbnailUrl", thumbnailUrl);
      
      toast({
        title: "YouTube ID Extracted",
        description: `Video ID: ${extractedId}`,
      });
    }
  };

  const onSubmit = (data: VideoForm) => {
    videoMutation.mutate(data);
  };

  const getStats = () => {
    const approvedVideos = videos.filter((v: Video) => v.isApproved).length;
    const pendingVideos = videos.filter((v: Video) => !v.isApproved).length;
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u: User) => u.currentDay > 1).length;

    return { approvedVideos, pendingVideos, totalUsers, activeUsers };
  };

  const stats = getStats();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-admin-header">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage videos, users, and system content</p>
            </div>
            <Button onClick={handleAddVideo} data-testid="button-add-video">
              <i className="fas fa-plus mr-2"></i>
              Add Video
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-approved-videos">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mr-4">
                    <i className="fas fa-check text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Videos</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-approved-count">
                      {stats.approvedVideos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-pending-videos">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center mr-4">
                    <i className="fas fa-clock text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Videos</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-pending-count">
                      {stats.pendingVideos}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-users">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mr-4">
                    <i className="fas fa-users text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-users-count">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-active-users">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mr-4">
                    <i className="fas fa-user-clock text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-active-users-count">
                      {stats.activeUsers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="videos" data-testid="tab-videos">Video Management</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">User Management</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-6">
              <Card data-testid="card-video-management">
                <CardHeader>
                  <CardTitle>Video Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {videosLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading videos...</p>
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-video text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-600 mb-4">No videos to manage</p>
                      <Button onClick={handleAddVideo} data-testid="button-add-first-video">
                        Add First Video
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {videos.map((video: Video) => (
                        <div key={video.id} className="border rounded-lg p-4" data-testid={`video-item-${video.id}`}>
                          <div className="flex items-start space-x-4">
                            <div className="w-32 h-20 bg-gray-900 rounded-lg overflow-hidden">
                              <VideoPlayer youtubeId={video.youtubeId} title={video.title} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-lg" data-testid={`video-title-${video.id}`}>
                                    {video.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {video.duration} min • {video.exerciseType} • {video.skillLevel}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {video.themeCompatibility.map((theme: string) => (
                                      <Badge key={theme} variant="secondary" className="text-xs">
                                        {theme}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant={video.isApproved ? "default" : "secondary"}
                                    data-testid={`video-status-${video.id}`}
                                  >
                                    {video.isApproved ? "Approved" : "Pending"}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2 mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditVideo(video)}
                                  data-testid={`button-edit-${video.id}`}
                                >
                                  <i className="fas fa-edit mr-1"></i>
                                  Edit
                                </Button>
                                
                                {!video.isApproved ? (
                                  <Button 
                                    size="sm"
                                    onClick={() => approvalMutation.mutate({ videoId: video.id, approved: true })}
                                    disabled={approvalMutation.isPending}
                                    data-testid={`button-approve-${video.id}`}
                                  >
                                    <i className="fas fa-check mr-1"></i>
                                    Approve
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => approvalMutation.mutate({ videoId: video.id, approved: false })}
                                    disabled={approvalMutation.isPending}
                                    data-testid={`button-unapprove-${video.id}`}
                                  >
                                    <i className="fas fa-times mr-1"></i>
                                    Unapprove
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteMutation.mutate(video.id)}
                                  disabled={deleteMutation.isPending}
                                  data-testid={`button-delete-${video.id}`}
                                >
                                  <i className="fas fa-trash mr-1"></i>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card data-testid="card-user-management">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading users...</p>
                    </div>
                  ) : allUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-users text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-600">No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allUsers.map((userItem: User) => (
                        <div key={userItem.id} className="border rounded-lg p-4" data-testid={`user-item-${userItem.id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold" data-testid={`user-name-${userItem.id}`}>
                                  {userItem.name}
                                </h4>
                                <p className="text-sm text-gray-600">{userItem.email}</p>
                                <p className="text-sm text-gray-500">
                                  Day {userItem.currentDay}/30 • {userItem.selectedTheme} theme
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <Badge variant={userItem.isAdmin ? "default" : "secondary"}>
                                {userItem.isAdmin ? "Admin" : "User"}
                              </Badge>
                              <p className="text-sm text-gray-500 mt-1">
                                Started: {userItem.startDate ? new Date(userItem.startDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Video Form Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-video-form">
          <DialogHeader>
            <DialogTitle>
              {selectedVideo ? "Edit Video" : "Add New Video"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Video title" data-testid="input-video-title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="youtube-url">YouTube URL or ID</Label>
                    <Input
                      id="youtube-url"
                      placeholder="Paste YouTube URL or enter video ID (e.g., dQw4w9WgXcQ)"
                      value={youtubeInput}
                      onChange={(e) => handleYoutubeInputChange(e.target.value)}
                      data-testid="input-youtube-url"
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-500">
                      Supports: youtube.com/watch?v=, youtu.be/, or direct video ID
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="youtubeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extracted YouTube ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Video ID will appear here"
                            data-testid="input-youtube-id"
                            {...field}
                            readOnly
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="120"
                          data-testid="input-duration"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? undefined : parseInt(val) || 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effortLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effort Level (1-5)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="5"
                          data-testid="input-effort-level"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? undefined : parseInt(val) || 0);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exerciseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-exercise-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="chair-yoga">Chair Yoga</SelectItem>
                          <SelectItem value="weights">Weights</SelectItem>
                          <SelectItem value="walking">Walking</SelectItem>
                          <SelectItem value="elliptical">Elliptical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-skill-level">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-equipment">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="light-weights">Light Weights</SelectItem>
                          <SelectItem value="resistance-band">Resistance Band</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="themeCompatibility"
                render={() => (
                  <FormItem>
                    <FormLabel>Theme Compatibility</FormLabel>
                    <div className="grid grid-cols-3 gap-4">
                      {["fun", "aggressive", "drill"].map((theme) => (
                        <FormField
                          key={theme}
                          control={form.control}
                          name="themeCompatibility"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(theme)}
                                  onCheckedChange={(checked) => {
                                    const updatedValue = checked
                                      ? [...(field.value || []), theme]
                                      : field.value?.filter((value) => value !== theme) || [];
                                    field.onChange(updatedValue);
                                  }}
                                  data-testid={`checkbox-theme-${theme}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {theme}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Video description..."
                        className="min-h-[80px]"
                        data-testid="textarea-description"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* YouTube Preview */}
              {form.watch("youtubeId") && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-lg font-semibold">Video Preview</h4>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${form.watch("youtubeId")}`}
                      title="Video Preview"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      data-testid="iframe-youtube-preview"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Video ID:</strong> {form.watch("youtubeId")}
                    </div>
                    <div>
                      <strong>Thumbnail:</strong> 
                      <a 
                        href={form.watch("thumbnailUrl")} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline ml-1"
                        data-testid="link-thumbnail-preview"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowVideoModal(false)} 
                  className="flex-1"
                  data-testid="button-cancel-video"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={videoMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-video"
                >
                  {videoMutation.isPending ? "Saving..." : selectedVideo ? "Update Video" : "Add Video"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
