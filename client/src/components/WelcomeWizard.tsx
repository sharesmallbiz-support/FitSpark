import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Target, Clock, Dumbbell, Heart, CheckCircle } from "lucide-react";

interface WelcomeWizardProps {
  onComplete: (goals: FitnessGoals) => void;
  onSkip: () => void;
}

interface FitnessGoals {
  primaryGoal: string;
  timeCommitment: number;
  fitnessLevel: string;
  healthConcerns: string[];
  motivationStyle: 'fun' | 'aggressive' | 'drill';
  preferredActivities: string[];
}

const steps = [
  { id: 'welcome', title: 'Welcome to FitSpark', icon: Heart },
  { id: 'primary-goal', title: 'Your Primary Goal', icon: Target },
  { id: 'time-commitment', title: 'Time Commitment', icon: Clock },
  { id: 'fitness-level', title: 'Current Fitness Level', icon: Dumbbell },
  { id: 'health-concerns', title: 'Health Considerations', icon: Heart },
  { id: 'motivation-style', title: 'Coaching Style', icon: Target },
  { id: 'activities', title: 'Preferred Activities', icon: Dumbbell },
  { id: 'complete', title: 'All Set!', icon: CheckCircle },
];

const primaryGoals = [
  { id: 'weight-loss', label: 'Lose Weight', description: 'Shed pounds and feel lighter' },
  { id: 'strength', label: 'Build Strength', description: 'Gain muscle and power' },
  { id: 'endurance', label: 'Improve Endurance', description: 'Boost stamina and energy' },
  { id: 'flexibility', label: 'Increase Flexibility', description: 'Improve mobility and balance' },
  { id: 'overall-health', label: 'Overall Health', description: 'General wellness and vitality' },
];

const fitnessLevels = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting my fitness journey' },
  { id: 'some-experience', label: 'Some Experience', description: 'I exercise occasionally' },
  { id: 'regular', label: 'Regular', description: 'I exercise 2-3 times per week' },
  { id: 'experienced', label: 'Experienced', description: 'I have a consistent routine' },
];

const healthConcerns = [
  'Joint pain or arthritis',
  'Back problems',
  'Heart conditions',
  'Diabetes',
  'High blood pressure',
  'Balance issues',
  'Recent injury recovery',
  'None of the above',
];

const motivationStyles = [
  {
    id: 'fun' as const,
    label: 'Fun & Encouraging',
    description: 'Positive, upbeat coaching with celebration of progress',
    color: 'bg-green-100 border-green-300 text-green-800',
  },
  {
    id: 'aggressive' as const,
    label: 'Direct & Challenging',
    description: 'Straightforward coaching that pushes you to excel',
    color: 'bg-red-100 border-red-300 text-red-800',
  },
  {
    id: 'drill' as const,
    label: 'Drill Sergeant',
    description: 'Military-style motivation with discipline and structure',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
  },
];

const activities = [
  'Chair Yoga',
  'Walking',
  'Light Weights',
  'Elliptical/Cardio',
  'Stretching',
  'Balance Exercises',
  'Resistance Bands',
  'Swimming',
];

export default function WelcomeWizard({ onComplete, onSkip }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState<FitnessGoals>({
    primaryGoal: '',
    timeCommitment: 30,
    fitnessLevel: '',
    healthConcerns: [],
    motivationStyle: 'fun',
    preferredActivities: [],
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setGoals({ ...goals, primaryGoal: goalId });
    setTimeout(nextStep, 300);
  };

  const handleFitnessLevelSelect = (level: string) => {
    setGoals({ ...goals, fitnessLevel: level });
    setTimeout(nextStep, 300);
  };

  const handleMotivationStyleSelect = (style: 'fun' | 'aggressive' | 'drill') => {
    setGoals({ ...goals, motivationStyle: style });
    setTimeout(nextStep, 300);
  };

  const toggleHealthConcern = (concern: string) => {
    const updated = goals.healthConcerns.includes(concern)
      ? goals.healthConcerns.filter(c => c !== concern)
      : [...goals.healthConcerns, concern];
    setGoals({ ...goals, healthConcerns: updated });
  };

  const toggleActivity = (activity: string) => {
    const updated = goals.preferredActivities.includes(activity)
      ? goals.preferredActivities.filter(a => a !== activity)
      : [...goals.preferredActivities, activity];
    setGoals({ ...goals, preferredActivities: updated });
  };

  const handleComplete = () => {
    onComplete(goals);
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <motion.div
                key={currentStep}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Icon className="w-6 h-6 text-gray-900" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>

          <CardContent className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Welcome Step */}
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-yellow-400">Welcome to FitSpark!</h3>
                      <p className="text-lg text-gray-600">
                        Let's create your personalized 30-day fitness journey. This quick setup will help us tailor the perfect program for you.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <Target className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm font-medium">Personalized Goals</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium">Flexible Timing</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Goal Step */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">What's your primary fitness goal?</h3>
                    <div className="grid gap-3">
                      {primaryGoals.map((goal) => (
                        <motion.button
                          key={goal.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleGoalSelect(goal.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            goals.primaryGoal === goal.id
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-sm text-gray-600">{goal.description}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Commitment Step */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-center">How much time can you commit daily?</h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-400">{goals.timeCommitment} minutes</div>
                        <p className="text-gray-600">per day</p>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        step="15"
                        value={goals.timeCommitment}
                        onChange={(e) => setGoals({ ...goals, timeCommitment: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>15 min</span>
                        <span>45 min</span>
                        <span>90 min</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fitness Level Step */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">What's your current fitness level?</h3>
                    <div className="grid gap-3">
                      {fitnessLevels.map((level) => (
                        <motion.button
                          key={level.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleFitnessLevelSelect(level.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            goals.fitnessLevel === level.id
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Concerns Step */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Any health considerations?</h3>
                    <p className="text-center text-gray-600">Select any that apply (we'll customize exercises accordingly)</p>
                    <div className="grid grid-cols-2 gap-3">
                      {healthConcerns.map((concern) => (
                        <motion.button
                          key={concern}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleHealthConcern(concern)}
                          className={`p-3 rounded-lg border-2 text-sm transition-colors ${
                            goals.healthConcerns.includes(concern)
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {concern}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivation Style Step */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Choose your coaching style</h3>
                    <div className="space-y-3">
                      {motivationStyles.map((style) => (
                        <motion.button
                          key={style.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleMotivationStyleSelect(style.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            goals.motivationStyle === style.id
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{style.label}</div>
                              <div className="text-sm text-gray-600">{style.description}</div>
                            </div>
                            <Badge className={style.color}>{style.label}</Badge>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activities Step */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">What activities interest you?</h3>
                    <p className="text-center text-gray-600">Select your favorites (we'll include more of these)</p>
                    <div className="grid grid-cols-2 gap-3">
                      {activities.map((activity) => (
                        <motion.button
                          key={activity}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleActivity(activity)}
                          className={`p-3 rounded-lg border-2 text-center transition-colors ${
                            goals.preferredActivities.includes(activity)
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {activity}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complete Step */}
                {currentStep === 7 && (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-600 mb-2">You're All Set!</h3>
                      <p className="text-gray-600">
                        We're creating your personalized 30-day fitness program based on your preferences.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                      <div className="text-sm"><strong>Goal:</strong> {primaryGoals.find(g => g.id === goals.primaryGoal)?.label}</div>
                      <div className="text-sm"><strong>Daily Time:</strong> {goals.timeCommitment} minutes</div>
                      <div className="text-sm"><strong>Level:</strong> {fitnessLevels.find(l => l.id === goals.fitnessLevel)?.label}</div>
                      <div className="text-sm"><strong>Style:</strong> {motivationStyles.find(s => s.id === goals.motivationStyle)?.label}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="flex justify-between items-center p-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-gray-500"
            >
              Skip Setup
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 flex items-center space-x-2"
              >
                <span>Start My Journey</span>
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !goals.primaryGoal) ||
                  (currentStep === 3 && !goals.fitnessLevel)
                }
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}