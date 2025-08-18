import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { themeConfig } = useTheme();
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    const name = [firstName, lastName].filter(Boolean).join(' ');
    if (!name) return user?.username?.substring(0, 2).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-home" },
    { path: "/workout-plans", label: "Workout Plans", icon: "fas fa-list" },
    { path: "/workout", label: "Today's Workout", icon: "fas fa-dumbbell" },
    { path: "/progress", label: "Progress", icon: "fas fa-chart-line" },
  ];

  if (user.role === 'Admin') {
    navItems.push({ path: "/admin", label: "Admin", icon: "fas fa-cog" });
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-fit-navy cursor-pointer" data-testid="logo-fitspark">
                FitSpark
              </h1>
            </Link>
            <span 
              className={`ml-3 text-sm text-white px-3 py-1 rounded-full font-medium ${themeConfig.colors.primary}`}
              data-testid="text-current-theme"
            >
              {themeConfig.name}
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-gray-600 hover:text-fit-navy font-medium transition-colors ${
                  location.startsWith(item.path) ? 'text-fit-navy' : ''
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <Link href="/profile">
                <p className="text-sm font-medium cursor-pointer hover:text-fit-navy transition-colors" data-testid="text-user-name">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                </p>
              </Link>
              <p className="text-xs text-gray-500" data-testid="text-current-day">
                Active User
              </p>
            </div>
            <Link href="/profile">
              <Avatar className="w-10 h-10 bg-fit-navy cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarFallback className="bg-fit-navy text-white font-semibold" data-testid="avatar-initials">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
