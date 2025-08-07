import type { User } from "@shared/schema";
import { useTheme } from "@/contexts/ThemeContext";

interface DailyMotivationProps {
  user: User;
  motivation?: string;
}

export default function DailyMotivation({ user, motivation }: DailyMotivationProps) {
  const { themeConfig } = useTheme();
  
  const getStreakCount = () => {
    // This would be calculated from actual progress data
    return Math.min(user.currentDay - 1, 12);
  };

  const getWeeklyGoal = () => {
    // This would be calculated from user preferences and progress
    return "4/5 Weekly Goals";
  };

  return (
    <section className="mb-8" data-testid="section-daily-motivation">
      <div className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white`}
           style={{ background: `linear-gradient(to right, ${themeConfig.primary}, ${themeConfig.accent})` }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2" data-testid="text-welcome-message">
              Great to see you back, {user.name}! {themeConfig.icon}
            </h2>
            <p className="text-lg opacity-90" data-testid="text-motivation-message">
              {motivation || "Every workout is a victory. You're building strength one day at a time!"}
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <i className="fas fa-fire text-orange-300 mr-2"></i>
                <span className="font-semibold" data-testid="text-streak-count">
                  {getStreakCount()} Day Streak
                </span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-trophy text-yellow-300 mr-2"></i>
                <span data-testid="text-weekly-goal">{getWeeklyGoal()}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold" data-testid="text-current-day">
                {user.currentDay}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
