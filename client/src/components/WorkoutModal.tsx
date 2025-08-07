import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { WorkoutPlan, User } from "@shared/schema";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutPlan;
  user: User;
}

export default function WorkoutModal({ isOpen, onClose, workout, user }: WorkoutModalProps) {
  const { themeConfig } = useTheme();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exerciseStates, setExerciseStates] = useState(
    workout.exercises.map(exercise => ({ 
      name: exercise.name, 
      completed: false, 
      duration: exercise.duration 
    }))
  );
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState(3);

  const progressMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/users/${user.id}/progress`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id, "achievements"] });
      
      // Update user's current day
      const nextDay = user.currentDay + 1;
      if (nextDay <= 30) {
        updateUser({ currentDay: nextDay });
      }
      
      toast({
        title: "Workout Completed!",
        description: "Great job! Your progress has been recorded.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleExerciseToggle = (index: number, completed: boolean) => {
    setExerciseStates(prev => 
      prev.map((exercise, i) => 
        i === index ? { ...exercise, completed } : exercise
      )
    );
  };

  const handleSubmit = () => {
    const completedExercises = exerciseStates.filter(e => e.completed);
    const minutesCompleted = completedExercises.reduce((total, e) => total + e.duration, 0);
    const isWorkoutCompleted = completedExercises.length === exerciseStates.length;

    progressMutation.mutate({
      day: workout.day,
      minutesCompleted,
      completed: isWorkoutCompleted,
      exercises: exerciseStates,
      notes,
      mood
    });
  };

  const completedCount = exerciseStates.filter(e => e.completed).length;
  const totalMinutes = exerciseStates.filter(e => e.completed).reduce((total, e) => total + e.duration, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="modal-workout">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{workout.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Summary */}
          <div className={`p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border ${themeConfig.colors.border}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Progress</span>
              <span className="text-sm font-medium" data-testid="text-exercise-progress">
                {completedCount}/{exerciseStates.length} exercises
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${themeConfig.colors.primary.split(' ')[0]}`}
                style={{ width: `${(completedCount / exerciseStates.length) * 100}%` }}
                data-testid="progress-bar-exercises"
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              <span data-testid="text-minutes-total">{totalMinutes} minutes completed</span>
            </div>
          </div>

          {/* Exercise Checklist */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Exercises</Label>
            {exerciseStates.map((exercise, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg"
                   data-testid={`exercise-checkbox-${index}`}>
                <Checkbox
                  checked={exercise.completed}
                  onCheckedChange={(checked) => handleExerciseToggle(index, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className={`font-medium ${exercise.completed ? 'line-through text-gray-500' : ''}`}>
                      {exercise.name}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">{exercise.duration} min</span>
                  </div>
                  {workout.exercises[index]?.instructions && (
                    <p className="text-sm text-gray-600 mt-1">
                      {workout.exercises[index].instructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mood Rating */}
          <div className="space-y-2">
            <Label>How do you feel after this workout?</Label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={mood === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(rating)}
                  className={mood === rating ? themeConfig.colors.primary : ""}
                  data-testid={`button-mood-${rating}`}
                >
                  {rating === 1 ? "😢" : rating === 2 ? "😐" : rating === 3 ? "🙂" : rating === 4 ? "😊" : "🤩"}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel? Any challenges or victories to note?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
              data-testid="textarea-workout-notes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={progressMutation.isPending}
              className={`flex-1 ${themeConfig.colors.primary}`}
              data-testid="button-save-progress"
            >
              {progressMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
