import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { themeConfig } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const user = await response.json();
      
      login(user);
      setLocation("/dashboard");
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to FitSpark.",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="lg:w-1/2 bg-gradient-to-br from-fit-navy to-blue-700 flex items-center justify-center p-8">
        <div className="max-w-md text-white text-center lg:text-left">
          <h1 className="text-5xl font-bold mb-4" data-testid="text-app-title">FitSpark</h1>
          <h2 className="text-2xl font-semibold mb-6">Reignite Your Fitness Journey</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-lg">Personalized 30-day fitness programs</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-lg">Chair yoga, walking & gentle strength training</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-lg">AI-powered coaching with 3 motivational themes</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <p className="text-lg">Daily progress tracking & achievements</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <p className="text-sm italic">"Finally, a fitness program designed for men over 55 that actually understands our needs. I've lost 15 pounds and feel stronger than I have in years!"</p>
            <p className="text-xs mt-2 font-semibold">- Mark, Age 58</p>
          </div>

          <p className="text-lg font-medium">Ready to get back in shape?</p>
        </div>
      </div>

      {/* Login Section */}
      <div className="lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:hidden">
            <h1 className="text-4xl font-bold text-fit-navy" data-testid="text-app-title-mobile">FitSpark</h1>
            <p className="mt-2 text-lg text-gray-600">Your 30-Day Fitness Journey</p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
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
                            placeholder="Enter your password"
                            data-testid="input-password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className={`w-full ${themeConfig.colors.primary}`}
                    disabled={isLoading}
                    data-testid="button-login"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium mb-2">🎯 New to FitSpark?</p>
                  <p className="text-sm text-green-700 mb-3">Join thousands of men over 55 who've transformed their health with our personalized fitness programs.</p>
                  <Link 
                    href="/register"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
                    data-testid="link-register"
                  >
                    Start Your 30-Day Journey Free
                  </Link>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ No equipment needed to get started</p>
                  <p>✓ Gentle exercises perfect for beginners</p>
                  <p>✓ AI creates your personal program in minutes</p>
                </div>

                <p className="text-xs text-gray-600">
                  Already have an account? Sign in above to continue your journey.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center text-xs text-gray-500 max-w-md">
            <p>Demo Accounts: Use "demo" or "admin" with password "demo123" to explore the platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
