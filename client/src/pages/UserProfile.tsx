import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import type { ApiUser } from "@/types/api";

interface UserProfileForm {
  firstName: string;
  lastName: string;
  age: number | null;
  weightPounds: number | null;
  targetWeightPounds: number | null;
  heightFeet: string;
  heightInches: string;
  gender: string;
  fitnessGoal: string;
  motivationTheme: string;
}

interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  age?: number;
  weightPounds?: number;
  targetWeightPounds?: number;
  heightFeet?: string;
  heightInches?: string;
  gender?: string;
  fitnessGoal?: string;
  motivationTheme?: string;
}

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [formData, setFormData] = useState<UserProfileForm>({
    firstName: "",
    lastName: "",
    age: null,
    weightPounds: null,
    targetWeightPounds: null,
    heightFeet: "",
    heightInches: "",
    gender: "",
    fitnessGoal: "",
    motivationTheme: "Fun",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
  }, [isAuthenticated, setLocation]);

  // Fetch latest user data when component mounts
  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (user?.id && isAuthenticated) {
        setIsFetchingUser(true);
        try {
          console.log('Fetching latest user data for user ID:', user.id);
          const latestUser = await authService.getUser(user.id);
          console.log('Latest user data received:', {
            heightFeet: latestUser.heightFeet,
            heightInches: latestUser.heightInches,
            gender: latestUser.gender
          });
          updateUser(latestUser);
        } catch (error) {
          console.error('Failed to fetch latest user data:', error);
          // If fetch fails, we'll use the existing user data
        } finally {
          setIsFetchingUser(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchLatestUserData();
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (user) {
      console.log('Setting form data from user:', {
        heightFeet: user.heightFeet,
        heightInches: user.heightInches,
        gender: user.gender
      });
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || null,
        weightPounds: user.weightPounds || null,
        targetWeightPounds: user.targetWeightPounds || null,
        heightFeet: user.heightFeet || "",
        heightInches: user.heightInches || "",
        gender: user.gender || "",
        fitnessGoal: user.fitnessGoal || "",
        motivationTheme: user.motivationTheme || "Fun",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UserProfileForm, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData: UserUpdateRequest = {
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        age: formData.age || undefined,
        weightPounds: formData.weightPounds || undefined,
        targetWeightPounds: formData.targetWeightPounds || undefined,
        heightFeet: formData.heightFeet.trim() || undefined,
        heightInches: formData.heightInches.trim() || undefined,
        gender: formData.gender.trim() || undefined,
        fitnessGoal: formData.fitnessGoal.trim() || undefined,
        motivationTheme: formData.motivationTheme,
      };

      console.log('Updating user with data:', updateData);
      const updatedUser = await authService.updateUser(user.id, updateData);
      console.log('Updated user received:', updatedUser);
      updateUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const name = [firstName, lastName].filter(Boolean).join(' ');
    if (!name) return user?.username?.substring(0, 2).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const heightFeetOptions = ['3', '4', '5', '6', '7', '8'];
  const heightInchesOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const motivationThemes = ['Fun', 'Aggressive', 'DrillSergeant'];

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  if (isFetchingUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-lg">Loading latest profile data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and fitness preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24 bg-fit-navy">
                    <AvatarFallback className="bg-fit-navy text-white font-semibold text-2xl">
                      {getInitials(formData.firstName, formData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {formData.firstName && formData.lastName 
                    ? `${formData.firstName} ${formData.lastName}` 
                    : user.username}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Theme</p>
                    <p className="font-medium">{formData.motivationTheme}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and fitness preferences. Username and email cannot be changed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  {/* Read-only fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={user.username}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Physical Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="18"
                        max="120"
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heightFeet">Height (Feet)</Label>
                      <Select value={formData.heightFeet} onValueChange={(value) => handleInputChange('heightFeet', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Feet" />
                        </SelectTrigger>
                        <SelectContent>
                          {heightFeetOptions.map(feet => (
                            <SelectItem key={feet} value={feet}>{feet} ft</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="heightInches">Height (Inches)</Label>
                      <Select value={formData.heightInches} onValueChange={(value) => handleInputChange('heightInches', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Inches" />
                        </SelectTrigger>
                        <SelectContent>
                          {heightInchesOptions.map(inches => (
                            <SelectItem key={inches} value={inches}>{inches} in</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weightPounds">Current Weight (lbs)</Label>
                      <Input
                        id="weightPounds"
                        type="number"
                        min="50"
                        max="500"
                        step="0.1"
                        value={formData.weightPounds || ''}
                        onChange={(e) => handleInputChange('weightPounds', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Current weight"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetWeightPounds">Target Weight (lbs)</Label>
                      <Input
                        id="targetWeightPounds"
                        type="number"
                        min="50"
                        max="500"
                        step="0.1"
                        value={formData.targetWeightPounds || ''}
                        onChange={(e) => handleInputChange('targetWeightPounds', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Target weight"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(gender => (
                          <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                    <Textarea
                      id="fitnessGoal"
                      value={formData.fitnessGoal}
                      onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                      placeholder="Describe your fitness goals..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="motivationTheme">Motivation Theme</Label>
                    <Select value={formData.motivationTheme} onValueChange={(value) => handleInputChange('motivationTheme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {motivationThemes.map(theme => (
                          <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Reset form to original user data
                        if (user) {
                          setFormData({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            age: user.age || null,
                            weightPounds: user.weightPounds || null,
                            targetWeightPounds: user.targetWeightPounds || null,
                            heightFeet: user.heightFeet || "",
                            heightInches: user.heightInches || "",
                            gender: user.gender || "",
                            fitnessGoal: user.fitnessGoal || "",
                            motivationTheme: user.motivationTheme || "Fun",
                          });
                        }
                      }}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
