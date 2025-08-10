import OpenAI from "openai";
import type { Theme, ExerciseType, WorkoutPlan, Video } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key"
});

export interface GenerateProgramParams {
  name: string;
  age: number;
  startWeight: number;
  targetWeight: number;
  theme: Theme;
  fitnessGoals?: {
    primaryGoal: string;
    timeCommitment: number;
    fitnessLevel: string;
    healthConcerns: string[];
    motivationStyle: 'fun' | 'aggressive' | 'drill';
    preferredActivities: string[];
  };
  availableVideos: Video[];
}

export interface DailyWorkoutPlan {
  day: number;
  title: string;
  description: string;
  totalMinutes: number;
  exercises: Array<{
    name: string;
    duration: number;
    videoId?: string;
    instructions: string;
  }>;
  motivationMessage: string;
}

export async function generatePersonalizedProgram(params: GenerateProgramParams): Promise<DailyWorkoutPlan[]> {
  const { name, age, startWeight, targetWeight, theme, fitnessGoals, availableVideos } = params;
  
  const themePersonalities = {
    fun: "encouraging, playful, and positive with emoji and excitement",
    aggressive: "intense, challenging, and motivating with strong language",
    drill: "disciplined, structured, and military-style with clear commands"
  };

  const videosByType = availableVideos.reduce((acc, video) => {
    if (!acc[video.exerciseType]) acc[video.exerciseType] = [];
    acc[video.exerciseType].push(video);
    return acc;
  }, {} as Record<string, Video[]>);

  const fitnessGoalsText = fitnessGoals ? `
Fitness Goals & Preferences:
- Primary Goal: ${fitnessGoals.primaryGoal}
- Daily Time Commitment: ${fitnessGoals.timeCommitment} minutes
- Fitness Level: ${fitnessGoals.fitnessLevel}
- Health Concerns: ${fitnessGoals.healthConcerns.length > 0 ? fitnessGoals.healthConcerns.join(', ') : 'None specified'}
- Preferred Activities: ${fitnessGoals.preferredActivities.length > 0 ? fitnessGoals.preferredActivities.join(', ') : 'All activities welcome'}
` : '';

  const prompt = `
Create a personalized 30-day fitness program for ${name}, a ${age}-year-old person looking to ${fitnessGoals?.primaryGoal === 'weight-loss' ? 'lose weight' : fitnessGoals?.primaryGoal === 'strength' ? 'build strength' : fitnessGoals?.primaryGoal === 'endurance' ? 'improve endurance' : fitnessGoals?.primaryGoal === 'flexibility' ? 'increase flexibility' : 'improve overall health'} from ${startWeight} lbs to ${targetWeight} lbs.

Theme: ${theme} - Use a ${themePersonalities[theme]} tone throughout.
${fitnessGoalsText}
Focus areas: Chair yoga, light weights, walking, and flexibility for people over 55.
${fitnessGoals?.healthConcerns && fitnessGoals.healthConcerns.length > 0 ? 
  `\nIMPORTANT: Accommodate these health considerations: ${fitnessGoals.healthConcerns.join(', ')}. Modify exercises accordingly for safety.` : ''}

Available videos by type:
${Object.entries(videosByType).map(([type, videos]) => 
  `${type}: ${videos.map(v => `"${v.title}" (${v.duration}min, effort: ${v.effortLevel}/5, id: ${v.id})`).join(', ')}`
).join('\n')}

Create a progressive 30-day program that:
1. Starts gentle and builds intensity gradually based on fitness level: ${fitnessGoals?.fitnessLevel || 'beginner'}
2. Alternates between different exercise types${fitnessGoals?.preferredActivities && fitnessGoals.preferredActivities.length > 0 ? ` (prioritize: ${fitnessGoals.preferredActivities.join(', ')})` : ''}
3. Includes rest days and active recovery
4. Provides specific motivation messages for each day in the ${theme} theme style
5. Uses the available videos when appropriate
6. Each workout should target ${fitnessGoals?.timeCommitment || 30} minutes total (adjustable based on user capacity)
7. Include specific exercise instructions for movements without videos
8. Ensure exercises are safe and appropriate for any health concerns mentioned

Return a JSON array of 30 daily workout plans with this structure:
{
  "day": number,
  "title": "string",
  "description": "string", 
  "totalMinutes": number,
  "exercises": [
    {
      "name": "string",
      "duration": number,
      "videoId": "string (if using available video)",
      "instructions": "detailed instructions"
    }
  ],
  "motivationMessage": "theme-appropriate daily message"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a certified fitness trainer specializing in programs for people over 55. Create safe, progressive, and engaging workout plans. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.workouts || result.days || result.program || [];
  } catch (error) {
    console.error("Error generating personalized program:", error);
    throw new Error("Failed to generate personalized program");
  }
}

export async function generateDailyMotivation(theme: Theme, day: number, userName: string): Promise<string> {
  const themeStyles = {
    fun: "upbeat, encouraging, and playful with emojis",
    aggressive: "intense, powerful, and challenging",
    drill: "disciplined, structured, and military-inspired"
  };

  const prompt = `
Generate a motivational message for ${userName} on day ${day} of his 30-day fitness journey.
Theme: ${theme} - Use a ${themeStyles[theme]} style.

The message should:
1. Be 1-2 sentences long
2. Reference the day number if relevant
3. Be encouraging and theme-appropriate
4. Focus on progress and consistency
5. Be specific to men over 55 getting back in shape

Respond with just the motivational message, no extra formatting.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a motivational fitness coach specializing in encouraging people over 55. Create inspiring, theme-appropriate messages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100
    });

    return response.choices[0].message.content?.trim() || "Keep going! Every day makes you stronger.";
  } catch (error) {
    console.error("Error generating daily motivation:", error);
    return "You're doing great! Stay consistent and trust the process.";
  }
}

export async function generateAchievementBadge(badgeType: string, theme: Theme, userName: string): Promise<{ title: string; description: string; icon: string }> {
  const prompt = `
Create an achievement badge for ${userName} who just earned: ${badgeType}
Theme: ${theme}

Generate a badge with:
1. Title: Short, impactful name (2-4 words)
2. Description: One sentence explanation of what was achieved
3. Icon: Font Awesome icon class (just the icon name like "trophy" or "fire")

Make it ${theme === 'fun' ? 'fun and celebratory' : theme === 'aggressive' ? 'powerful and intense' : 'disciplined and structured'}.

Return JSON in this format:
{
  "title": "string",
  "description": "string", 
  "icon": "string"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating motivational achievement badges for fitness apps. Keep responses concise and impactful."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      title: result.title || "Achievement Unlocked",
      description: result.description || "Great job on your progress!",
      icon: result.icon || "trophy"
    };
  } catch (error) {
    console.error("Error generating achievement badge:", error);
    return {
      title: "Achievement Unlocked",
      description: "Great job on your progress!",
      icon: "trophy"
    };
  }
}
