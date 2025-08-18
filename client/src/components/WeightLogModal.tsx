import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/apiService";
import type { ApiUser } from "@/types/api";

interface WeightLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ApiUser;
}

export default function WeightLogModal({ isOpen, onClose, user }: WeightLogModalProps) {
  const { themeConfig } = useTheme();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState(user.weightPounds?.toString() || "");

  const weightMutation = useMutation({
    mutationFn: async (newWeight: number) => {
      // Update user's current weight using the correct API service
      const updatedUser = await authService.updateUser(user.id, { 
        weightPounds: newWeight 
      });
      
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id, "progress"] });
      
      // Update the user context with the new weight
      updateUser(updatedUser);
      
      toast({
        title: "Weight Updated!",
        description: `Your weight has been recorded as ${updatedUser.weightPounds} lbs.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update your weight. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(weight);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight.",
        variant: "destructive",
      });
      return;
    }

    weightMutation.mutate(weightValue);
  };

  // Calculate progress toward target weight
  const currentWeight = parseFloat(weight) || user.weightPounds || 0;
  const targetWeight = user.targetWeightPounds || 0;
  const weightToGo = targetWeight > 0 ? Math.abs(currentWeight - targetWeight) : 0;  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-weight-log">
        <DialogHeader>
          <DialogTitle>Update Your Weight</DialogTitle>
          <DialogDescription>
            Record your current weight to track your progress toward your fitness goals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Current Weight:</span>
                <div className="font-semibold" data-testid="text-start-weight-modal">
                  {user.weightPounds} lbs
                </div>
              </div>
              <div>
                <span className="text-gray-600">Target Weight:</span>
                <div className="font-semibold" data-testid="text-target-weight-modal">
                  {user.targetWeightPounds} lbs
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Current Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="50"
                max="500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your current weight"
                required
                data-testid="input-current-weight"
              />
            </div>

            {weight && !isNaN(parseFloat(weight)) && (
              <div className={`p-3 rounded-lg ${
                weightToGo > 0 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-sm font-medium">
                  {weightToGo > 0 && (
                    <span className="text-blue-700" data-testid="text-weight-to-goal">
                      <i className="fas fa-target mr-1"></i>
                      {weightToGo.toFixed(1)} lbs to goal
                    </span>
                  )}
                  {weightToGo === 0 && (
                    <span className="text-green-700" data-testid="text-weight-goal-reached">
                      <i className="fas fa-check mr-1"></i>
                      Goal weight reached!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              data-testid="button-cancel-weight"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={weightMutation.isPending}
              className={`flex-1 ${themeConfig.colors.primary}`}
              data-testid="button-save-weight"
            >
              {weightMutation.isPending ? "Saving..." : "Save Weight"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
