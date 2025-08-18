import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseCatalogService } from '@/lib/apiService';
import { Exercise } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Edit, Trash2, Plus, RefreshCw, Search, Filter, Info, Heart, Shield, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import Navigation from '@/components/Navigation';

interface ExerciseFormData {
  name: string;
  description: string;
  category: string;
  difficultyLevel: string;
  sets?: number;
  reps?: number;
  durationMinutes?: number;
  instructions: string;
  safetyNotes: string;
  benefits: string;
  videoUrl?: string;
  videoTitle?: string;
  displayOrder: number;
  isRequired: boolean;
}

const ExerciseCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    description: '',
    category: '',
    difficultyLevel: 'Low',
    instructions: '',
    safetyNotes: '',
    benefits: '',
    displayOrder: 1,
    isRequired: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exercises
  const { data: exercises, isLoading: loadingExercises, error: exercisesError } = useQuery({
    queryKey: ['catalogExercises', selectedCategory, selectedDifficulty],
    queryFn: () => exerciseCatalogService.getCatalogExercises({
      category: selectedCategory || undefined,
      difficultyLevel: selectedDifficulty || undefined,
      pageSize: 100
    })
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['exerciseCategories'],
    queryFn: () => exerciseCatalogService.getCategories()
  });

  // Fetch catalog status
  const { data: catalogStatus } = useQuery({
    queryKey: ['catalogStatus'],
    queryFn: () => exerciseCatalogService.getCatalogStatus()
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ExerciseFormData) => exerciseCatalogService.createCatalogExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogExercises'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Exercise created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create exercise",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ExerciseFormData> }) => 
      exerciseCatalogService.updateCatalogExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogExercises'] });
      setIsEditDialogOpen(false);
      setEditingExercise(null);
      resetForm();
      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update exercise",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => exerciseCatalogService.deleteCatalogExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogExercises'] });
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete exercise",
        variant: "destructive",
      });
    }
  });

  const reloadMutation = useMutation({
    mutationFn: () => exerciseCatalogService.reloadChairExercises(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogExercises'] });
      queryClient.invalidateQueries({ queryKey: ['catalogStatus'] });
      toast({
        title: "Success",
        description: "Chair exercises catalog reloaded successfully",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      difficultyLevel: 'Low',
      instructions: '',
      safetyNotes: '',
      benefits: '',
      displayOrder: 1,
      isRequired: false
    });
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      category: exercise.category,
      difficultyLevel: exercise.difficultyLevel,
      sets: exercise.sets,
      reps: exercise.reps,
      durationMinutes: exercise.durationMinutes,
      instructions: exercise.instructions || '',
      safetyNotes: exercise.safetyNotes || '',
      benefits: exercise.benefits || '',
      videoUrl: exercise.videoUrl,
      videoTitle: exercise.videoTitle,
      displayOrder: exercise.displayOrder,
      isRequired: exercise.isRequired
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise) {
      updateMutation.mutate({ id: editingExercise.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (exercise: Exercise) => {
    if (confirm(`Are you sure you want to delete "${exercise.name}"?`)) {
      deleteMutation.mutate(exercise.id);
    }
  };

  const filteredExercises = exercises?.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Low-Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Medium-High': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingExercises) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading exercise catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exercise Catalog</h1>
              <p className="text-gray-600 mt-2">
                Manage the FitSpark Chair Exercise collection for 55+ adults
              </p>
            </div>
          </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => reloadMutation.mutate()}
            disabled={reloadMutation.isPending}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reloadMutation.isPending ? 'animate-spin' : ''}`} />
            Reload Catalog
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      </div>

      {/* Catalog Status */}
      {catalogStatus && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Catalog Status:</strong> {catalogStatus.totalExercises} exercises across {catalogStatus.totalCategories} categories.
            Chair exercises loaded: {catalogStatus.isChairExercisesCatalogLoaded ? 'Yes' : 'No'}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={selectedDifficulty || "all"} onValueChange={(value) => setSelectedDifficulty(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Low-Medium">Low-Medium</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Medium-High">Medium-High</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedDifficulty('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Tabs defaultValue="grouped" className="w-full">
        <TabsList>
          <TabsTrigger value="grouped">Grouped by Category</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grouped">
          {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
            <Card key={category} className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">{category}</CardTitle>
                <CardDescription>{categoryExercises.length} exercises</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryExercises.map(exercise => (
                    <ExerciseCard 
                      key={exercise.id} 
                      exercise={exercise} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="list">
          <div className="space-y-4">
            {filteredExercises.map(exercise => (
              <ExerciseListItem 
                key={exercise.id} 
                exercise={exercise} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
            <DialogDescription>
              Create a new exercise for the catalog
            </DialogDescription>
          </DialogHeader>
          <ExerciseForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>
              Update exercise information
            </DialogDescription>
          </DialogHeader>
          <ExerciseForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
};

// Exercise Card Component
const ExerciseCard: React.FC<{
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  getDifficultyColor: (difficulty: string) => string;
}> = ({ exercise, onEdit, onDelete, getDifficultyColor }) => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg leading-tight">{exercise.name}</CardTitle>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(exercise)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(exercise)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Badge className={getDifficultyColor(exercise.difficultyLevel)}>
        {exercise.difficultyLevel}
      </Badge>
    </CardHeader>
    <CardContent className="pt-0">
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{exercise.description}</p>
      
      {exercise.benefits && (
        <div className="mb-2">
          <div className="flex items-center text-sm font-medium text-green-700 mb-1">
            <Heart className="h-3 w-3 mr-1" />
            Benefits
          </div>
          <p className="text-xs text-gray-600">{exercise.benefits}</p>
        </div>
      )}
      
      {exercise.safetyNotes && (
        <div className="mb-2">
          <div className="flex items-center text-sm font-medium text-red-700 mb-1">
            <Shield className="h-3 w-3 mr-1" />
            Safety
          </div>
          <p className="text-xs text-gray-600">{exercise.safetyNotes}</p>
        </div>
      )}
      
      <div className="flex justify-between text-xs text-gray-500 mt-3">
        <span>Sets: {exercise.sets || 'N/A'}</span>
        <span>Reps: {exercise.reps || 'N/A'}</span>
        <span>Duration: {exercise.durationMinutes ? `${exercise.durationMinutes}m` : 'N/A'}</span>
      </div>
    </CardContent>
  </Card>
);

// Exercise List Item Component
const ExerciseListItem: React.FC<{
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  getDifficultyColor: (difficulty: string) => string;
}> = ({ exercise, onEdit, onDelete, getDifficultyColor }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">{exercise.name}</h3>
            <Badge className={getDifficultyColor(exercise.difficultyLevel)}>
              {exercise.difficultyLevel}
            </Badge>
            <Badge variant="outline">{exercise.category}</Badge>
          </div>
          <p className="text-gray-600 mb-2">{exercise.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Sets:</span> {exercise.sets || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Reps:</span> {exercise.reps || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {exercise.durationMinutes ? `${exercise.durationMinutes}m` : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Order:</span> {exercise.displayOrder}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button size="sm" variant="outline" onClick={() => onEdit(exercise)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(exercise)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Exercise Form Component
const ExerciseForm: React.FC<{
  formData: ExerciseFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExerciseFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  categories?: string[];
}> = ({ formData, setFormData, onSubmit, isLoading, categories }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Exercise Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
            <SelectItem value="Upper Body">Upper Body</SelectItem>
            <SelectItem value="Core & Abdominal">Core & Abdominal</SelectItem>
            <SelectItem value="Lower Body & Balance">Lower Body & Balance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="difficultyLevel">Difficulty Level</Label>
        <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Low-Medium">Low-Medium</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Medium-High">Medium-High</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="sets">Sets</Label>
        <Input
          id="sets"
          type="number"
          min="1"
          value={formData.sets || ''}
          onChange={(e) => setFormData({ ...formData, sets: e.target.value ? parseInt(e.target.value) : undefined })}
        />
      </div>
      <div>
        <Label htmlFor="reps">Repetitions</Label>
        <Input
          id="reps"
          type="number"
          min="1"
          value={formData.reps || ''}
          onChange={(e) => setFormData({ ...formData, reps: e.target.value ? parseInt(e.target.value) : undefined })}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="durationMinutes">Duration (minutes)</Label>
        <Input
          id="durationMinutes"
          type="number"
          min="1"
          value={formData.durationMinutes || ''}
          onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
        />
      </div>
      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input
          id="displayOrder"
          type="number"
          min="1"
          value={formData.displayOrder}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
        />
      </div>
    </div>

    <div>
      <Label htmlFor="instructions">Instructions</Label>
      <Textarea
        id="instructions"
        value={formData.instructions}
        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
        rows={3}
        placeholder="Step-by-step instructions for performing the exercise"
      />
    </div>

    <div>
      <Label htmlFor="benefits">Benefits</Label>
      <Textarea
        id="benefits"
        value={formData.benefits}
        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
        rows={2}
        placeholder="Health and fitness benefits of this exercise"
      />
    </div>

    <div>
      <Label htmlFor="safetyNotes">Safety Notes</Label>
      <Textarea
        id="safetyNotes"
        value={formData.safetyNotes}
        onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
        rows={2}
        placeholder="Important safety considerations and precautions"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="videoUrl">Video URL</Label>
        <Input
          id="videoUrl"
          type="url"
          value={formData.videoUrl || ''}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          placeholder="https://example.com/video"
        />
      </div>
      <div>
        <Label htmlFor="videoTitle">Video Title</Label>
        <Input
          id="videoTitle"
          value={formData.videoTitle || ''}
          onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
        />
      </div>
    </div>

    <div className="flex justify-end space-x-2">
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Exercise'}
      </Button>
    </div>
  </form>
);

export default ExerciseCatalog;
