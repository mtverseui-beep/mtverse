export interface Universe {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  bgGradient: string;
  count: string;
  color: string;
}

export const UNIVERSES: Universe[] = [
  {
    id: "prompts",
    name: "Prompt Hub",
    description: "Free copy-ready prompts for image, chat, and creative workflows",
    icon: "Sparkles",
    href: "/prompts",
    gradient: "from-fuchsia-500 to-pink-600",
    bgGradient: "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/20 dark:to-pink-950/20",
    count: "AI Prompts",
    color: "pink",
  },
];
