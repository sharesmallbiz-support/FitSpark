import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import TodaysWorkout from "@/components/TodaysWorkout";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutPlan } from "@/types/api";

export default function WorkoutPlan() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { day } = useParams();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const workoutDay = day ? parseInt(day) : 1; // Default to day 1 since ApiUser doesn't have currentDay

  const { data: workout, isLoading } = useQuery<WorkoutPlan>({
    queryKey: ["/api/users", user?.id, "workout-plan", workoutDay],
    enabled: !!user?.id,
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your workout plan...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-workout-header">
            Day {workoutDay} Workout
          </h1>
          <p className="text-gray-600 mt-2">
            Today's workout plan
          </p>
        </div>

        <TodaysWorkout workout={workout} user={user} />
      </main>
    </div>
  );
}
