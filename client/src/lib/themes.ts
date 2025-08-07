export type Theme = "fun" | "aggressive" | "drill";

export const themes = {
  fun: {
    name: "Fun Mode",
    description: "Playful and encouraging with positive energy",
    primary: "hsl(219, 78%, 60%)", // theme-fun blue
    accent: "hsl(34, 92%, 56%)", // warm orange accent
    background: "hsl(219, 20%, 97%)",
    card: "hsl(0, 0%, 100%)",
    colors: {
      primary: "bg-blue-500 hover:bg-blue-600",
      accent: "bg-orange-400 hover:bg-orange-500",
      text: "text-blue-700",
      border: "border-blue-200"
    },
    icon: "🎉"
  },
  aggressive: {
    name: "Aggressive Mode", 
    description: "Intense and challenging with powerful motivation",
    primary: "hsl(0, 84%, 60%)", // theme-aggressive red
    accent: "hsl(25, 95%, 53%)", // fiery orange
    background: "hsl(0, 20%, 97%)",
    card: "hsl(0, 0%, 100%)",
    colors: {
      primary: "bg-red-600 hover:bg-red-700",
      accent: "bg-orange-500 hover:bg-orange-600", 
      text: "text-red-700",
      border: "border-red-200"
    },
    icon: "🔥"
  },
  drill: {
    name: "Drill Sergeant Mode",
    description: "Disciplined and structured military-style approach", 
    primary: "hsl(84, 81%, 44%)", // theme-drill green
    accent: "hsl(45, 93%, 47%)", // military gold
    background: "hsl(84, 20%, 97%)",
    card: "hsl(0, 0%, 100%)",
    colors: {
      primary: "bg-green-600 hover:bg-green-700",
      accent: "bg-yellow-500 hover:bg-yellow-600",
      text: "text-green-700", 
      border: "border-green-200"
    },
    icon: "⚡"
  }
};

export function getThemeConfig(theme: Theme) {
  return themes[theme] || themes.fun;
}
