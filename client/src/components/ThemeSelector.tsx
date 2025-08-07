import { themes, type Theme } from "@/lib/themes";
import { Card, CardContent } from "@/components/ui/card";

interface ThemeSelectorProps {
  selectedTheme: Theme;
  onThemeSelect: (theme: Theme) => void;
}

export default function ThemeSelector({ selectedTheme, onThemeSelect }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(themes).map(([key, config]) => (
        <Card 
          key={key}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTheme === key 
              ? `ring-2 ${config.colors.border} bg-gradient-to-br from-white to-gray-50` 
              : 'hover:shadow-lg'
          }`}
          onClick={() => onThemeSelect(key as Theme)}
          data-testid={`card-theme-${key}`}
        >
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">{config.icon}</div>
            <h4 className="font-semibold text-lg mb-2">{config.name}</h4>
            <p className="text-sm text-gray-600 mb-4">{config.description}</p>
            
            <div className="space-y-2">
              <div className={`h-3 w-full rounded-full ${config.colors.primary.split(' ')[0]}`}></div>
              <div className="flex space-x-1">
                <div className={`h-2 w-full rounded ${config.colors.primary.split(' ')[0]} opacity-80`}></div>
                <div className={`h-2 w-full rounded ${config.colors.accent.split(' ')[0]} opacity-80`}></div>
              </div>
            </div>
            
            {selectedTheme === key && (
              <div className="mt-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.colors.primary} text-white`}>
                  Selected
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
