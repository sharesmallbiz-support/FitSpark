import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import VideoPlayer from "@/components/VideoPlayer";
import WorkoutModal from "@/components/WorkoutModal";
import WeightLogModal from "@/components/WeightLogModal";
import type { WorkoutPlan } from "@/types/api";
import type { ApiUser } from "@/types/api";

interface PlanExercise { name: string; duration: number; videoId?: string; instructions?: string }

interface TodaysWorkoutProps {
  workout?: WorkoutPlan;
  user: ApiUser;
}

export default function TodaysWorkout({ workout, user }: TodaysWorkoutProps) {
  const { themeConfig } = useTheme();
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  
  if (!workout) {
    return (
      <section className="mb-8" data-testid="section-todays-workout">
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <i className="fas fa-dumbbell text-blue-500 mr-3"></i>
          Today's Workout Plan
        </h3>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No workout plan found for today.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Use daily workouts from the API structure
  const currentDayWorkout = workout?.dailyWorkouts?.[0]; // Get first daily workout for now
  const exercises = currentDayWorkout?.exercises || [];
  const primaryVideoId = exercises.find(e => e.videoUrl)?.videoUrl?.includes('youtube') ? 
    exercises.find(e => e.videoUrl)?.videoUrl?.split('v=')[1]?.split('&')[0] : null;

  return (
    <>
      <section className="mb-8" data-testid="section-todays-workout">
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <i className="fas fa-dumbbell text-blue-500 mr-3"></i>
          Today's Workout Plan
        </h3>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Workout Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold" data-testid="text-workout-title">
                {currentDayWorkout?.title || workout?.name}
              </h4>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full" 
                    data-testid="text-workout-duration">
                {currentDayWorkout?.estimatedDurationMinutes || 30} mins
              </span>
            </div>
            
            {/* Video Preview */}
            {primaryVideoId && (
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                <VideoPlayer 
                  youtubeId={primaryVideoId}
                  title={currentDayWorkout?.title || workout?.name || "Workout Video"}
                  data-testid="video-workout-preview"
                />
              </div>
            )}

            {/* Exercise List */}
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                     data-testid={`exercise-item-${index}`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3 ${themeConfig.colors.primary.split(' ')[0]}`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-lg">{exercise.name}</span>
                  </div>
                  <span className="text-gray-600">{exercise.durationMinutes || 0} mins</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button 
                className={`flex-1 ${themeConfig.colors.primary} text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors`}
                onClick={() => setShowWorkoutModal(true)}
                data-testid="button-start-workout"
              >
                <i className="fas fa-play mr-2"></i>
                Start Workout
              </Button>
              <Button 
                variant="outline"
                className="px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="button-preview-workout"
              >
                <i className="fas fa-eye"></i>
              </Button>
            </div>
          </div>

          {/* Progress & Weight Tracking */}
          <div className="space-y-6">
            {/* Today's Progress */}
            <Card>
              <CardContent className="p-6">
                <h5 className="font-semibold text-lg mb-4 flex items-center">
                  <i className="fas fa-target text-green-600 mr-2"></i>
                  Today's Progress
                </h5>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Minutes Completed</span>
                    <span className="font-semibold text-xl" data-testid="text-minutes-completed">
                      0 / {currentDayWorkout?.estimatedDurationMinutes || 30}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: "0%" }} data-testid="progress-bar-workout"></div>
                  </div>
                  <div className="pt-2">
                    <Button 
                      className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => setShowWorkoutModal(true)}
                      data-testid="button-mark-complete"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Mark as Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Tracking */}
            <Card>
              <CardContent className="p-6">
                <h5 className="font-semibold text-lg mb-4 flex items-center">
                  <i className="fas fa-weight text-blue-600 mr-2"></i>
                  Weight Tracking
                </h5>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-current-weight">
                    {user.weightPounds} lbs
                  </div>
                  <div className="text-sm text-green-600 mb-4">
                    <i className="fas fa-arrow-down mr-1"></i>
                    <span data-testid="text-weight-loss">
                      {user.targetWeightPounds && user.weightPounds ? 
                        `${Math.abs(user.weightPounds - user.targetWeightPounds)} lbs to goal` : 
                        'Set your target weight'
                      }
                    </span>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full border border-gray-300 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    onClick={() => setShowWeightModal(true)}
                    data-testid="button-update-weight"
                  >
                    Update Weight
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h5 className="font-semibold text-lg mb-3 flex items-center text-amber-800">
                <i className="fas fa-lightbulb text-amber-600 mr-2"></i>
                Today's Tip
              </h5>
              <p className="text-amber-800" data-testid="text-daily-tip">
                Remember to stay hydrated! Aim for a glass of water before and after your workout.
              </p>
            </div>
          </div>
        </div>
      </section>

      <WorkoutModal 
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        workout={workout}
        user={user}
      />

      <WeightLogModal 
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        user={user}
      />
    </>
  );
}
