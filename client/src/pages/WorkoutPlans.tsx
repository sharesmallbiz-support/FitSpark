import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { WorkoutPlan, CreateWorkoutPlanDto, UpdateWorkoutPlanDto } from "@/types/api";

export default function WorkoutPlans() {
  const { user, isAuthenticated } = useAuth();
  const { themeConfig } = useTheme();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: workoutPlans = [], isLoading } = useQuery<WorkoutPlan[]>({
    queryKey: ["/api/workouts/plans/user", user?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/workouts/plans/user/${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme.toLowerCase()) {
      case 'fun': return 'bg-blue-100 text-blue-800';
      case 'aggressive': return 'bg-orange-100 text-orange-800';
      case 'drill': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-workout-plans-header">
                My Workout Plans
              </h1>
              <p className="text-gray-600 mt-2">
                Review, create, and manage your personalized workout plans
              </p>
            </div>
            <Button 
              className={`${themeConfig.colors.primary} text-white`}
              onClick={() => setShowCreateModal(true)}
              data-testid="button-create-plan"
            >
              <i className="fas fa-plus mr-2"></i>
              Create New Plan
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your workout plans...</p>
          </div>
        ) : workoutPlans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-dumbbell text-gray-400 text-6xl mb-6"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Workout Plans Yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first personalized workout plan
              </p>
              <Button 
                className={`${themeConfig.colors.primary} text-white`}
                onClick={() => setShowCreateModal(true)}
                data-testid="button-create-first-plan"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedPlan(plan)} data-testid={`workout-plan-${plan.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Badge className={getDifficultyColor(plan.difficultyLevel)}>
                          {plan.difficultyLevel}
                        </Badge>
                        <Badge className={getThemeColor(plan.motivationTheme)}>
                          {plan.motivationTheme}
                        </Badge>
                        {plan.isActive && (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>{plan.durationDays} days</div>
                      <div>{plan.dailyWorkouts?.length || 0} workouts</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {plan.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Created: {formatDate(plan.createdAt)}</span>
                    {plan.startDate && (
                      <span>Started: {formatDate(plan.startDate)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Workout Plan Modal */}
        <CreateWorkoutPlanModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          user={user}
        />

        {/* Plan Details Modal */}
        {selectedPlan && (
          <WorkoutPlanDetailsModal 
            plan={selectedPlan}
            isOpen={!!selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onEdit={() => {
              setEditingPlan(selectedPlan);
              setSelectedPlan(null);
            }}
            user={user}
          />
        )}

        {/* Edit Workout Plan Modal */}
        {editingPlan && (
          <EditWorkoutPlanModal 
            plan={editingPlan}
            isOpen={!!editingPlan}
            onClose={() => setEditingPlan(null)}
            user={user}
          />
        )}
      </main>
    </div>
  );
}

interface CreateWorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

function CreateWorkoutPlanModal({ isOpen, onClose, user }: CreateWorkoutPlanModalProps) {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationDays: 30,
    difficultyLevel: 'Beginner',
    motivationTheme: user?.motivationTheme || 'Fun',
    startDate: new Date().toISOString().split('T')[0]
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: CreateWorkoutPlanDto) => {
      const response = await apiRequest("POST", `/api/workouts/plans/user/${user.id}`, planData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/plans/user", user.id] });
      toast({
        title: "Workout Plan Created!",
        description: "Your new workout plan has been created successfully.",
      });
      onClose();
      setFormData({
        name: '',
        description: '',
        durationDays: 30,
        difficultyLevel: 'Beginner',
        motivationTheme: user?.motivationTheme || 'Fun',
        startDate: new Date().toISOString().split('T')[0]
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create workout plan. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a plan name.",
        variant: "destructive",
      });
      return;
    }

    createPlanMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      durationDays: formData.durationDays,
      difficultyLevel: formData.difficultyLevel,
      motivationTheme: formData.motivationTheme,
      startDate: new Date(formData.startDate)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-create-plan">
        <DialogHeader>
          <DialogTitle>Create New Workout Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Fitness Challenge"
              required
              data-testid="input-plan-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your workout plan goals..."
              rows={3}
              data-testid="textarea-plan-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                data-testid="input-plan-duration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                data-testid="input-plan-start-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}>
              <SelectTrigger data-testid="select-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Motivation Theme</Label>
            <Select value={formData.motivationTheme} onValueChange={(value) => setFormData({ ...formData, motivationTheme: value })}>
              <SelectTrigger data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fun">Fun & Encouraging</SelectItem>
                <SelectItem value="Aggressive">Aggressive & Intense</SelectItem>
                <SelectItem value="Drill">Drill Sergeant Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createPlanMutation.isPending}
              className={`flex-1 ${themeConfig.colors.primary}`}
              data-testid="button-save-plan"
            >
              {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface WorkoutPlanDetailsModalProps {
  plan: WorkoutPlan;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  user: any;
}

function WorkoutPlanDetailsModal({ plan, isOpen, onClose, onEdit, user }: WorkoutPlanDetailsModalProps) {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const response = await apiRequest("PUT", `/api/workouts/plans/${plan.id}/user/${user.id}/status`, {
        isActive
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/plans/user", user.id] });
      toast({
        title: `Plan ${plan.isActive ? 'Deactivated' : 'Activated'}!`,
        description: `Your workout plan has been ${plan.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update plan status. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="modal-plan-details">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{plan.name}</span>
            <div className="flex space-x-2">
              <Badge className={plan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {plan.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{plan.durationDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <Badge className={getDifficultyColor(plan.difficultyLevel)}>
                    {plan.difficultyLevel}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Theme:</span>
                  <Badge className={getThemeColor(plan.motivationTheme)}>
                    {plan.motivationTheme}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(plan.createdAt)}</span>
                </div>
                {plan.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium">{formatDate(plan.startDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Workouts:</span>
                  <span className="font-medium">{plan.dailyWorkouts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{plan.dailyWorkouts?.length || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-500 h-2 rounded-full w-0"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {plan.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{plan.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Daily Workouts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Daily Workouts ({plan.dailyWorkouts?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.dailyWorkouts && plan.dailyWorkouts.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {plan.dailyWorkouts.map((workout) => (
                    <div key={workout.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Day {workout.dayNumber}: {workout.title}</h4>
                          {workout.description && (
                            <p className="text-sm text-gray-600 mt-1">{workout.description}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {workout.estimatedDurationMinutes} min
                        </div>
                      </div>
                      {workout.isRestDay && (
                        <Badge className="mt-2 bg-blue-100 text-blue-800">Rest Day</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No workouts defined yet. This plan needs to be configured.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button 
              className={`flex-1 ${themeConfig.colors.primary}`}
              onClick={onEdit}
              data-testid="button-edit-plan"
            >
              Edit Plan
            </Button>
            {plan.isActive ? (
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => toggleStatusMutation.mutate(false)}
                disabled={toggleStatusMutation.isPending}
                data-testid="button-deactivate-plan"
              >
                {toggleStatusMutation.isPending ? "Deactivating..." : "Deactivate"}
              </Button>
            ) : (
              <Button 
                className={`flex-1 ${themeConfig.colors.primary}`}
                onClick={() => toggleStatusMutation.mutate(true)}
                disabled={toggleStatusMutation.isPending}
                data-testid="button-activate-plan"
              >
                {toggleStatusMutation.isPending ? "Activating..." : "Activate"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getThemeColor(theme: string) {
  switch (theme.toLowerCase()) {
    case 'fun': return 'bg-blue-100 text-blue-800';
    case 'aggressive': return 'bg-orange-100 text-orange-800';
    case 'drill': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

interface EditWorkoutPlanModalProps {
  plan: WorkoutPlan;
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

function EditWorkoutPlanModal({ plan, isOpen, onClose, user }: EditWorkoutPlanModalProps) {
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: plan.name,
    description: plan.description || '',
    durationDays: plan.durationDays,
    difficultyLevel: plan.difficultyLevel,
    motivationTheme: plan.motivationTheme,
    startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : ''
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (planData: UpdateWorkoutPlanDto) => {
      const response = await apiRequest("PUT", `/api/workouts/plans/${plan.id}/user/${user.id}`, planData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/plans/user", user.id] });
      toast({
        title: "Workout Plan Updated!",
        description: "Your workout plan has been updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update workout plan. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a plan name.",
        variant: "destructive",
      });
      return;
    }

    const updateData: UpdateWorkoutPlanDto = {};
    
    // Only include changed fields
    if (formData.name !== plan.name) {
      updateData.name = formData.name;
    }
    if (formData.description !== (plan.description || '')) {
      updateData.description = formData.description || undefined;
    }
    if (formData.durationDays !== plan.durationDays) {
      updateData.durationDays = formData.durationDays;
    }
    if (formData.difficultyLevel !== plan.difficultyLevel) {
      updateData.difficultyLevel = formData.difficultyLevel;
    }
    if (formData.motivationTheme !== plan.motivationTheme) {
      updateData.motivationTheme = formData.motivationTheme;
    }
    if (formData.startDate && formData.startDate !== (plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : '')) {
      updateData.startDate = new Date(formData.startDate);
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes were made to the workout plan.",
      });
      onClose();
      return;
    }

    updatePlanMutation.mutate(updateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-edit-plan">
        <DialogHeader>
          <DialogTitle>Edit Workout Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Plan Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Fitness Challenge"
              required
              data-testid="input-edit-plan-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your workout plan goals..."
              rows={3}
              data-testid="textarea-edit-plan-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (Days)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                max="365"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                data-testid="input-edit-plan-duration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                data-testid="input-edit-plan-start-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-difficulty">Difficulty Level</Label>
            <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}>
              <SelectTrigger data-testid="select-edit-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-theme">Motivation Theme</Label>
            <Select value={formData.motivationTheme} onValueChange={(value) => setFormData({ ...formData, motivationTheme: value })}>
              <SelectTrigger data-testid="select-edit-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fun">Fun & Encouraging</SelectItem>
                <SelectItem value="Aggressive">Aggressive & Intense</SelectItem>
                <SelectItem value="Drill">Drill Sergeant Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updatePlanMutation.isPending}
              className={`flex-1 ${themeConfig.colors.primary}`}
              data-testid="button-update-plan"
            >
              {updatePlanMutation.isPending ? "Updating..." : "Update Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
