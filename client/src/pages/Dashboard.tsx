import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import DailyMotivation from "@/components/DailyMotivation";
import TodaysWorkout from "@/components/TodaysWorkout";
import ProgressChart from "@/components/ProgressChart";
import AchievementsPanel from "@/components/AchievementsPanel";
import type { WorkoutPlan, DailyProgress, Achievement } from "@shared/schema";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { setTheme } = useTheme();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    if (user?.selectedTheme) {
      setTheme(user.selectedTheme);
    }
  }, [isAuthenticated, user, setTheme, setLocation]);

  const { data: motivation } = useQuery<{ message: string }>({
    queryKey: ["/api/users", user?.id, "motivation"],
    enabled: !!user?.id,
  });

  const { data: todaysWorkout } = useQuery<WorkoutPlan>({
    queryKey: ["/api/users", user?.id, "workout-plan", user?.currentDay],
    enabled: !!user?.id && !!user?.currentDay,
  });

  const { data: progress } = useQuery<DailyProgress[]>({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/users", user?.id, "achievements"],
    enabled: !!user?.id,
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DailyMotivation 
          user={user} 
          motivation={motivation?.message} 
          data-testid="section-daily-motivation"
        />
        
        <TodaysWorkout 
          workout={todaysWorkout} 
          user={user}
          data-testid="section-todays-workout"
        />
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <ProgressChart 
            progress={progress || []} 
            data-testid="section-progress-chart"
          />
          <AchievementsPanel 
            achievements={achievements || []} 
            user={user}
            data-testid="section-achievements"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h5 className="font-semibold text-lg mb-4 flex items-center">
              <i className="fas fa-cog text-gray-600 mr-2"></i>
              Quick Settings
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="font-medium">Current Theme</span>
                <span className="text-sm text-blue-600" data-testid="text-current-theme">
                  {user.selectedTheme}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="font-medium">Daily Goal</span>
                <span className="text-sm text-gray-600">35 minutes</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h5 className="font-semibold text-lg mb-4 flex items-center">
              <i className="fas fa-calendar text-gray-600 mr-2"></i>
              This Week
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Days Completed</span>
                <span className="font-semibold" data-testid="text-week-completed">
                  {progress?.filter(p => {
                    const date = new Date(p.date);
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    return date >= weekStart && p.completed;
                  }).length || 0}/7
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Minutes</span>
                <span className="font-semibold text-blue-600">
                  {progress?.filter(p => {
                    const date = new Date(p.date);
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    return date >= weekStart;
                  }).reduce((total, p) => total + (p.minutesCompleted || 0), 0) || 0} min
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h5 className="font-semibold text-lg mb-4 flex items-center">
              <i className="fas fa-heart text-red-500 mr-2"></i>
              Health Stats
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Start Weight</span>
                <span className="font-semibold" data-testid="text-start-weight">
                  {user.startWeight} lbs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Weight</span>
                <span className="font-semibold" data-testid="text-current-weight">
                  {user.currentWeight} lbs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-green-600" data-testid="text-weight-progress">
                  {user.startWeight && user.currentWeight ? 
                    `${user.startWeight - user.currentWeight} lbs lost` : 
                    'Track your progress'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
