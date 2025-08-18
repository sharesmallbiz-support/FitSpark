import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import type { DailyProgress } from "@/types/api";

interface ProgressChartProps {
  progress: DailyProgress[];
}

export default function ProgressChart({ progress }: ProgressChartProps) {
  const { themeConfig } = useTheme();

  const getWeeklyData = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    return weekDays.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      
      const dayProgress = progress.find(p => {
        const progressDate = new Date(p.date);
        return progressDate.toDateString() === date.toDateString();
      });
      
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      
      return {
        day,
        date,
        progress: dayProgress,
        isToday,
        isFuture,
        minutesCompleted: dayProgress?.actualDurationMinutes || 0,
        targetMinutes: 35, // Default target
        completed: dayProgress?.isCompleted || false
      };
    });
  };

  const weeklyData = getWeeklyData();
  const totalWeeklyMinutes = weeklyData.reduce((total, day) => total + day.minutesCompleted, 0);
  const weeklyGoal = 175; // 5 days × 35 minutes

  return (
    <Card data-testid="card-progress-chart">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold">Weekly Progress</h4>
          <Select defaultValue="this-week">
            <SelectTrigger className="w-32" data-testid="select-timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          {weeklyData.map((dayData, index) => {
            const percentage = Math.min((dayData.minutesCompleted / dayData.targetMinutes) * 100, 100);
            
            return (
              <div key={index} className="flex items-center space-x-3" data-testid={`progress-day-${dayData.day.toLowerCase()}`}>
                <div className="w-12 text-sm font-medium text-gray-600">
                  {dayData.day}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className={`h-4 rounded-full transition-all duration-300 ${
                      dayData.isFuture 
                        ? 'bg-gray-200' 
                        : dayData.completed 
                          ? themeConfig.colors.primary.split(' ')[0]
                          : 'bg-yellow-400'
                    }`}
                    style={{ width: `${dayData.isFuture ? 0 : percentage}%` }}
                  ></div>
                  {dayData.isToday && (
                    <div className="absolute right-2 top-0 h-4 flex items-center">
                      <span className="text-xs font-medium text-gray-600">Today</span>
                    </div>
                  )}
                </div>
                <div className="w-16 text-sm font-semibold text-right">
                  {dayData.isFuture ? (
                    <span className="text-gray-400">--</span>
                  ) : dayData.isToday && dayData.minutesCompleted === 0 ? (
                    <span className="text-gray-500">Today</span>
                  ) : (
                    <span data-testid={`minutes-${dayData.day.toLowerCase()}`}>
                      {dayData.minutesCompleted} min
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Weekly Goal: {weeklyGoal} minutes</span>
            <span className={`font-semibold ${themeConfig.colors.text}`} data-testid="text-weekly-total">
              {totalWeeklyMinutes}/{weeklyGoal} min
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${themeConfig.colors.primary.split(' ')[0]}`}
              style={{ width: `${Math.min((totalWeeklyMinutes / weeklyGoal) * 100, 100)}%` }}
              data-testid="progress-bar-weekly"
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
