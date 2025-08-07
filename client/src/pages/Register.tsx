import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ThemeSelector from "@/components/ThemeSelector";
import WelcomeWizard from "@/components/WelcomeWizard";
import type { Theme } from "@/lib/themes";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  age: z.number().min(18, "Must be at least 18 years old").max(120, "Please enter a valid age"),
  startWeight: z.number().min(50, "Please enter a valid weight").max(500, "Please enter a valid weight"),
  targetWeight: z.number().min(50, "Please enter a valid target weight").max(500, "Please enter a valid target weight"),
  selectedTheme: z.enum(["fun", "aggressive", "drill"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { setTheme, themeConfig } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>("fun");
  const [showWizard, setShowWizard] = useState(true);
  const [wizardData, setWizardData] = useState<any>(null);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      age: wizardData?.timeCommitment === 15 ? 65 : wizardData?.timeCommitment === 30 ? 58 : 55,
      startWeight: 190,
      targetWeight: 175,
      selectedTheme: wizardData?.motivationStyle || "fun",
    },
  });

  const onThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setTheme(theme);
    form.setValue("selectedTheme", theme);
  };

  const handleWizardComplete = (goals: any) => {
    setWizardData(goals);
    setSelectedTheme(goals.motivationStyle);
    setTheme(goals.motivationStyle);
    form.setValue("selectedTheme", goals.motivationStyle);
    setShowWizard(false);
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const enhancedData = {
        ...data,
        fitnessGoals: wizardData || {
          primaryGoal: 'overall-health',
          timeCommitment: 30,
          fitnessLevel: 'beginner',
          healthConcerns: [],
          motivationStyle: data.selectedTheme,
          preferredActivities: []
        }
      };
      
      const response = await apiRequest("POST", "/api/auth/register", enhancedData);
      const user = await response.json();
      
      login(user);
      setTheme(data.selectedTheme);
      setLocation("/dashboard");
      
      toast({
        title: "Welcome to FitSpark!",
        description: wizardData 
          ? "Your personalized 30-day program has been created based on your goals."
          : "Your 30-day fitness program is ready to start.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showWizard && (
        <WelcomeWizard 
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      )}
      <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="min-h-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto pb-8">
          <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-fit-navy" data-testid="text-app-title">FitSpark</h1>
          <p className="mt-2 text-lg text-gray-600">Start Your 30-Day Fitness Journey</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>
              Tell us about yourself to create your personalized fitness program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a username" 
                              data-testid="input-username"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a password"
                              data-testid="input-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name"
                              data-testid="input-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email"
                              data-testid="input-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fitness Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Your age"
                              data-testid="input-age"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val) || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Weight (lbs)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="190"
                              data-testid="input-start-weight"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val) || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Weight (lbs)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="175"
                              data-testid="input-target-weight"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? undefined : parseInt(val) || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Choose Your Motivation Style</h3>
                  <ThemeSelector 
                    selectedTheme={selectedTheme} 
                    onThemeSelect={onThemeSelect}
                    data-testid="selector-theme"
                  />
                </div>

                <Button 
                  type="submit" 
                  className={`w-full ${themeConfig.colors.primary}`}
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? "Creating Your Program..." : "Start My 30-Day Journey"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className={`font-medium ${themeConfig.colors.text} hover:underline`} data-testid="link-login">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
    </>
  );
}
