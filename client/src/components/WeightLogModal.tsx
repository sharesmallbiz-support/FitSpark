import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface WeightLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function WeightLogModal({ isOpen, onClose, user }: WeightLogModalProps) {
  const { themeConfig } = useTheme();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState(user.currentWeight?.toString() || "");

  const weightMutation = useMutation({
    mutationFn: async (newWeight: number) => {
      // Update user's current weight
      await apiRequest("PATCH", `/api/users/${user.id}`, { currentWeight: newWeight });
      
      // Log today's weight in progress
      const today = new Date().toISOString().split('T')[0];
      return apiRequest("POST", `/api/users/${user.id}/progress`, {
        day: user.currentDay,
        weight: newWeight,
        date: today
      });
    },
    onSuccess: (_, newWeight) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id, "progress"] });
      
      updateUser({ currentWeight: newWeight });
      
      toast({
        title: "Weight Updated!",
        description: `Your weight has been recorded as ${newWeight} lbs.`,
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

  const weightChange = user.startWeight && parseFloat(weight) 
    ? user.startWeight - parseFloat(weight)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-weight-log">
        <DialogHeader>
          <DialogTitle>Update Your Weight</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Start Weight:</span>
                <div className="font-semibold" data-testid="text-start-weight-modal">
                  {user.startWeight} lbs
                </div>
              </div>
              <div>
                <span className="text-gray-600">Target Weight:</span>
                <div className="font-semibold" data-testid="text-target-weight-modal">
                  {user.targetWeight} lbs
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
                weightChange > 0 
                  ? 'bg-green-50 border border-green-200' 
                  : weightChange < 0 
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-sm font-medium">
                  {weightChange > 0 && (
                    <span className="text-green-700" data-testid="text-weight-loss">
                      <i className="fas fa-arrow-down mr-1"></i>
                      {weightChange.toFixed(1)} lbs lost
                    </span>
                  )}
                  {weightChange < 0 && (
                    <span className="text-red-700" data-testid="text-weight-gain">
                      <i className="fas fa-arrow-up mr-1"></i>
                      {Math.abs(weightChange).toFixed(1)} lbs gained
                    </span>
                  )}
                  {weightChange === 0 && (
                    <span className="text-gray-700" data-testid="text-weight-same">
                      No change from start
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
