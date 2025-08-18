import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exerciseCatalogService } from "@/lib/apiService";

interface Exercise {
  id: number;
  name: string;
  description?: string;
  category: string;
  sets?: number;
  reps?: number;
  durationMinutes?: number;
  difficultyLevel: string;
  safetyNotes?: string;
  benefits?: string;
  instructions?: string;
  isTemplate: boolean;
}

interface ExerciseCatalogProps {
  onClose?: () => void;
}

export function ExerciseCatalog({ onClose }: ExerciseCatalogProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Exercise>>({});

  const categories = [
    'all',
    'Upper Body',
    'Core & Abdominal', 
    'Lower Body & Balance'
  ];

  const difficultyLevels = [
    'Low',
    'Medium',
    'Moderate',
    'Intermediate'
  ];

  useEffect(() => {
    loadExercises();
  }, [selectedCategory]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await exerciseCatalogService.getCatalogExercises(params);
      setExercises(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setEditForm(exercise);
    setIsEditing(true);
  };

  const handleSaveExercise = async () => {
    if (!selectedExercise || !editForm.name) return;

    try {
      setError(null);
      
      const updateData = {
        name: editForm.name,
        description: editForm.description || '',
        category: editForm.category || selectedExercise.category,
        sets: editForm.sets || null,
        reps: editForm.reps || null,
        durationMinutes: editForm.durationMinutes || null,
        difficultyLevel: editForm.difficultyLevel || selectedExercise.difficultyLevel,
        safetyNotes: editForm.safetyNotes || '',
        benefits: editForm.benefits || '',
        instructions: editForm.instructions || ''
      };

      const updatedExercise = await exerciseCatalogService.updateCatalogExercise(selectedExercise.id, updateData);
      
      setExercises(exercises.map(ex => 
        ex.id === selectedExercise.id ? updatedExercise : ex
      ));
      
      setIsEditing(false);
      setSelectedExercise(null);
      setEditForm({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      setError(null);
      await exerciseCatalogService.deleteCatalogExercise(exerciseId);
      
      setExercises(exercises.filter(ex => ex.id !== exerciseId));
      
      if (selectedExercise?.id === exerciseId) {
        setSelectedExercise(null);
        setIsEditing(false);
        setEditForm({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise');
    }
  };

  const groupedExercises = exercises.reduce((acc, exercise) => {
    const category = exercise.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading exercise catalog...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exercise Catalog Management</CardTitle>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Label htmlFor="category">Filter by Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exercise List */}
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Total exercises: {exercises.length}
              </div>
              
              {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-2 text-blue-700">
                    {category} ({categoryExercises.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryExercises.map(exercise => (
                      <Card 
                        key={exercise.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedExercise?.id === exercise.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-gray-600 flex items-center space-x-2">
                                <Badge variant="outline">
                                  {exercise.difficultyLevel}
                                </Badge>
                                {exercise.durationMinutes && (
                                  <span>{exercise.durationMinutes} min</span>
                                )}
                                {exercise.sets && exercise.reps && (
                                  <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditExercise(exercise);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteExercise(exercise.id);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          {exercise.description && (
                            <div className="text-sm text-gray-700 mt-1">
                              {exercise.description.substring(0, 100)}
                              {exercise.description.length > 100 && '...'}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              {exercises.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No exercises found for the selected category.
                </div>
              )}
            </div>

            {/* Exercise Details/Edit Form */}
            <div>
              {selectedExercise && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{isEditing ? 'Edit Exercise' : 'Exercise Details'}</span>
                      {!isEditing && (
                        <Button 
                          size="sm" 
                          onClick={() => handleEditExercise(selectedExercise)}
                        >
                          Edit
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="name">Exercise Name *</Label>
                          <Input
                            id="name"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            value={editForm.category || selectedExercise.category} 
                            onValueChange={(value) => setEditForm({...editForm, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.slice(1).map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select 
                            value={editForm.difficultyLevel || selectedExercise.difficultyLevel}
                            onValueChange={(value) => setEditForm({...editForm, difficultyLevel: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {difficultyLevels.map(level => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor="sets">Sets</Label>
                            <Input
                              id="sets"
                              type="number"
                              value={editForm.sets || ''}
                              onChange={(e) => setEditForm({...editForm, sets: parseInt(e.target.value) || undefined})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reps">Reps</Label>
                            <Input
                              id="reps"
                              type="number"
                              value={editForm.reps || ''}
                              onChange={(e) => setEditForm({...editForm, reps: parseInt(e.target.value) || undefined})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration (min)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={editForm.durationMinutes || ''}
                              onChange={(e) => setEditForm({...editForm, durationMinutes: parseInt(e.target.value) || undefined})}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="instructions">Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={editForm.instructions || ''}
                            onChange={(e) => setEditForm({...editForm, instructions: e.target.value})}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="benefits">Benefits</Label>
                          <Textarea
                            id="benefits"
                            value={editForm.benefits || ''}
                            onChange={(e) => setEditForm({...editForm, benefits: e.target.value})}
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="safety">Safety Notes</Label>
                          <Textarea
                            id="safety"
                            value={editForm.safetyNotes || ''}
                            onChange={(e) => setEditForm({...editForm, safetyNotes: e.target.value})}
                            rows={2}
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={handleSaveExercise}>
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsEditing(false);
                              setEditForm({});
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="font-semibold">{selectedExercise.name}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                            <Badge variant="outline">
                              {selectedExercise.category}
                            </Badge>
                            <Badge variant="outline">
                              {selectedExercise.difficultyLevel}
                            </Badge>
                          </div>
                        </div>

                        {(selectedExercise.sets || selectedExercise.reps || selectedExercise.durationMinutes) && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm font-medium mb-1">Exercise Parameters:</div>
                            <div className="text-sm space-y-1">
                              {selectedExercise.sets && (
                                <div>Sets: {selectedExercise.sets}</div>
                              )}
                              {selectedExercise.reps && (
                                <div>Reps: {selectedExercise.reps}</div>
                              )}
                              {selectedExercise.durationMinutes && (
                                <div>Duration: {selectedExercise.durationMinutes} minutes</div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedExercise.description && (
                          <div>
                            <div className="text-sm font-medium mb-1">Description:</div>
                            <div className="text-sm text-gray-700">{selectedExercise.description}</div>
                          </div>
                        )}

                        {selectedExercise.instructions && (
                          <div>
                            <div className="text-sm font-medium mb-1">Instructions:</div>
                            <div className="text-sm text-gray-700">{selectedExercise.instructions}</div>
                          </div>
                        )}

                        {selectedExercise.benefits && (
                          <div>
                            <div className="text-sm font-medium mb-1">Benefits:</div>
                            <div className="text-sm text-gray-700">{selectedExercise.benefits}</div>
                          </div>
                        )}

                        {selectedExercise.safetyNotes && (
                          <div>
                            <div className="text-sm font-medium mb-1">Safety Notes:</div>
                            <div className="text-sm text-gray-700">{selectedExercise.safetyNotes}</div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {!selectedExercise && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    Select an exercise from the list to view details
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExerciseCatalog;
