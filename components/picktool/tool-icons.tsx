import { Bot, Clapperboard, Image, Sparkles, UserRound, Video, WandSparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getToolIcon(slug: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    chatgpt: Bot,
    claude: Sparkles,
    capcut: Clapperboard,
    runway: Video,
    kling: WandSparkles,
    canva: Image,
    heygen: UserRound,
    invideo: Video
  };

  return icons[slug] ?? Sparkles;
}
