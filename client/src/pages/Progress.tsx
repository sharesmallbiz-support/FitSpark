import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import WeightLogModal from "@/components/WeightLogModal";
import type { DailyProgress, Achievement } from "@shared/schema";
import { useEffect } from "react";

export default function Progress() {
  const { user, isAuthenticated } = useAuth();
  const { themeConfig } = useTheme();
  const [, setLocation] = useLocation();
  const [timeframe, setTimeframe] = useState("30-days");
  const [showWeightModal, setShowWeightModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: progress = [], isLoading } = useQuery<DailyProgress[]>({
    queryKey: ["/api/users", user?.id, "progress"],
    enabled: !!user?.id,
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/users", user?.id, "achievements"],
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
              <p className="text-gray-600">Loading your progress...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const getFilteredProgress = () => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeframe) {
      case "7-days":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30-days":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "all-time":
        cutoffDate = new Date(0);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 30);
    }

    return progress.filter((p: DailyProgress) => new Date(p.date) >= cutoffDate);
  };

  const filteredProgress = getFilteredProgress();
  const completedWorkouts = filteredProgress.filter((p: DailyProgress) => p.completed).length;
  const totalMinutes = filteredProgress.reduce((sum: number, p: DailyProgress) => sum + (p.minutesCompleted || 0), 0);
  const averageMinutes = filteredProgress.length > 0 ? Math.round(totalMinutes / filteredProgress.length) : 0;

  const getWeightData = () => {
    return progress
      .filter((p: DailyProgress) => p.weight)
      .sort((a: DailyProgress, b: DailyProgress) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const weightData = getWeightData();
  const latestWeight = weightData[weightData.length - 1]?.weight || user.currentWeight;
  const weightLoss = user.startWeight && latestWeight ? user.startWeight - latestWeight : 0;

  const getStreakData = () => {
    const sortedProgress = [...progress]
      .sort((a: DailyProgress, b: DailyProgress) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedProgress.length; i++) {
      if (sortedProgress[i].completed) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (i === 0) currentStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  };

  const { currentStreak, longestStreak } = getStreakData();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-progress-header">
                Your Progress
              </h1>
              <p className="text-gray-600 mt-2">Track your fitness journey and celebrate your achievements</p>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40" data-testid="select-progress-timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7-days">Last 7 Days</SelectItem>
                <SelectItem value="30-days">Last 30 Days</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-workouts-completed">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg ${themeConfig.colors.primary} flex items-center justify-center mr-4`}>
                    <i className="fas fa-check text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Workouts Completed</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-completed-workouts">
                      {completedWorkouts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-minutes">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg ${themeConfig.colors.accent} flex items-center justify-center mr-4`}>
                    <i className="fas fa-clock text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-total-minutes">
                      {totalMinutes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-current-streak">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mr-4">
                    <i className="fas fa-fire text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-current-streak">
                      {currentStreak} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-weight-progress">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mr-4">
                    <i className="fas fa-weight text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weight Lost</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="text-weight-lost">
                      {weightLoss > 0 ? `${weightLoss.toFixed(1)} lbs` : '0 lbs'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Weight Tracking Chart */}
            <Card data-testid="card-weight-chart">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Weight Progress</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowWeightModal(true)}
                    data-testid="button-log-weight"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Log Weight
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weightData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Start</p>
                        <p className="text-lg font-bold" data-testid="text-weight-start">
                          {user.startWeight} lbs
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current</p>
                        <p className="text-lg font-bold" data-testid="text-weight-current">
                          {latestWeight} lbs
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Target</p>
                        <p className="text-lg font-bold" data-testid="text-weight-target">
                          {user.targetWeight} lbs
                        </p>
                      </div>
                    </div>
                    
                    {/* Simple weight trend visualization */}
                    <div className="mt-6">
                      <div className="space-y-2">
                        {weightData.slice(-10).map((entry: DailyProgress, index: number) => {
                          const date = new Date(entry.date).toLocaleDateString();
                          const weight = entry.weight || 0;
                          const percentage = user.startWeight ? 
                            Math.max(0, Math.min(100, ((user.startWeight - weight) / (user.startWeight - (user.targetWeight || user.startWeight))) * 100)) : 0;
                          
                          return (
                            <div key={index} className="flex items-center space-x-3" data-testid={`weight-entry-${index}`}>
                              <div className="w-20 text-xs text-gray-600">{date}</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-16 text-sm font-medium text-right">{weight} lbs</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-weight text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-600 mb-4">No weight data recorded yet</p>
                    <Button onClick={() => setShowWeightModal(true)} data-testid="button-start-tracking">
                      Start Tracking Weight
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Activity */}
            <Card data-testid="card-daily-activity">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProgress.slice(-7).map((day: DailyProgress, index: number) => {
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg"
                           data-testid={`daily-activity-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            day.completed ? 'bg-green-500' : day.minutesCompleted ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}>
                            {day.completed ? (
                              <i className="fas fa-check text-white text-sm"></i>
                            ) : day.minutesCompleted ? (
                              <i className="fas fa-clock text-white text-sm"></i>
                            ) : (
                              <i className="fas fa-times text-gray-500 text-sm"></i>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{dayName}</p>
                            <p className="text-sm text-gray-600">{dateStr}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{day.minutesCompleted || 0} min</p>
                          {day.completed && (
                            <p className="text-sm text-green-600">Completed</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements History */}
          <Card data-testid="card-achievements-history">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-trophy text-yellow-500 mr-2"></i>
                Achievement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((achievement: Achievement, index: number) => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 border rounded-lg"
                         data-testid={`achievement-${index}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.theme === 'fun' ? 'bg-blue-500' :
                        achievement.theme === 'aggressive' ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        <i className={`fas fa-${achievement.icon} text-white`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-trophy text-gray-400 text-4xl mb-4"></i>
                  <p className="text-gray-600">Complete workouts to earn achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card data-testid="card-streak-stats">
              <CardHeader>
                <CardTitle>Streak Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Streak</span>
                    <span className="font-bold text-xl" data-testid="text-current-streak-detail">
                      {currentStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Longest Streak</span>
                    <span className="font-bold text-xl" data-testid="text-longest-streak">
                      {longestStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-bold text-xl" data-testid="text-completion-rate">
                      {progress.length > 0 ? Math.round((completedWorkouts / progress.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-workout-stats">
              <CardHeader>
                <CardTitle>Workout Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Minutes/Day</span>
                    <span className="font-bold text-xl" data-testid="text-average-minutes">
                      {averageMinutes} min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Days Active</span>
                    <span className="font-bold text-xl" data-testid="text-days-active">
                      {progress.filter((p: DailyProgress) => p.minutesCompleted && p.minutesCompleted > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Challenge Day</span>
                    <span className="font-bold text-xl" data-testid="text-challenge-day">
                      {user.currentDay}/30
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <WeightLogModal 
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        user={user}
      />
    </>
  );
}
