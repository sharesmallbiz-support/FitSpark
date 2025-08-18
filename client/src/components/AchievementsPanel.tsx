import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import type { Achievement } from "@/types/api";
import type { ApiUser } from "@/types/api";

interface AchievementsPanelProps {
  achievements: Achievement[];
  user: ApiUser;
}

export default function AchievementsPanel({ achievements, user }: AchievementsPanelProps) {
  const { themeConfig } = useTheme();

  const recentAchievement = achievements[0]; // Most recent achievement

  const badgeColors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-purple-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500"
  ];

  const upcomingBadges = [
    { name: "Weekend Warrior", icon: "star", description: "Complete 2 weekend workouts", progress: 1, target: 2 },
    { name: "Marathon Week", icon: "running", description: "Complete all 7 days in a week", progress: 4, target: 7 },
    { name: "Weight Loss Champion", icon: "trophy", description: "Lose 10 pounds", progress: user.targetWeightPounds && user.weightPounds ? Math.max(0, user.weightPounds - user.targetWeightPounds) : 0, target: 10 }
  ];

  return (
    <Card data-testid="card-achievements">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold flex items-center">
            <i className="fas fa-trophy text-yellow-500 mr-2"></i>
            Achievements
          </h4>
          <span className="text-sm text-gray-600" data-testid="text-total-badges">
            {achievements.length} Earned
          </span>
        </div>

        {/* Recent Achievement */}
        {recentAchievement && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-star text-white text-lg"></i>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900" data-testid="text-recent-achievement-title">
                  {recentAchievement.name}
                </h5>
                <p className="text-sm text-gray-600" data-testid="text-recent-achievement-desc">
                  {recentAchievement.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badge Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {achievements.slice(0, 8).map((achievement, index) => (
            <div key={achievement.id} className="text-center" data-testid={`badge-${index}`}>
              <div className={`w-12 h-12 ${badgeColors[index % badgeColors.length]} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <i className="fas fa-trophy text-white"></i>
              </div>
              <span className="text-xs font-medium text-gray-700">{achievement.name}</span>
            </div>
          ))}
          
          {/* Empty badges for upcoming achievements */}
          {Array.from({ length: Math.max(0, 8 - achievements.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="text-center opacity-50">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-star text-gray-500"></i>
              </div>
              <span className="text-xs font-medium text-gray-500">Coming Soon</span>
            </div>
          ))}
        </div>

        {/* Progress to Next Badge */}
        {upcomingBadges.length > 0 && (
          <div className="space-y-4">
            <h5 className="font-semibold text-sm text-gray-700">Next Achievements</h5>
            {upcomingBadges.slice(0, 2).map((badge, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                  <span className="text-sm text-gray-600" data-testid={`badge-progress-${index}`}>
                    {Math.min(badge.progress, badge.target)}/{badge.target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${themeConfig.colors.primary.split(' ')[0]}`}
                    style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
                    data-testid={`progress-bar-badge-${index}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
