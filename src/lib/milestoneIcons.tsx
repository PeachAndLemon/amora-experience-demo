import {
  RefreshCw,
  Flower2,
  MessageCircle,
  Handshake,
  Sprout,
  HeartHandshake,
  Castle,
  Sparkles,
  Palette,
  Wine,
  Star,
  HeartPulse,
  Medal,
  UtensilsCrossed,
  Bath,
  Building,
  Gem,
  Music,
  Hand,
  Ear,
  CircleDot,
  Mountain,
  Compass,
  Sunrise,
  LucideIcon,
} from 'lucide-react';

// Icon mapping for milestones (pillars), stamps, and rewards
export const iconMap: Record<string, LucideIcon> = {
  // 6 Core Pillars
  'sync-up': RefreshCw,
  'altitude-resilience': Mountain,
  'the-glow': Sunrise,
  'the-canvas': Palette,
  'soulstice': Flower2,
  'dig-deep': Compass,
  
  // Stamps - icon IDs
  'refresh': RefreshCw,
  'flower': Flower2,
  'message': MessageCircle,
  'handshake': Handshake,
  'sprout': Sprout,
  'heart-handshake': HeartHandshake,
  'castle': Castle,
  'sparkles': Sparkles,
  'palette': Palette,
  'wine': Wine,
  'star': Star,
  'heart-pulse': HeartPulse,
  'medal': Medal,
  'utensils': UtensilsCrossed,
  'bath': Bath,
  'building': Building,
  'gem': Gem,
  'music': Music,
  'hand': Hand,
  'ear': Ear,
  'peace': CircleDot,
  'mountain': Mountain,
  'compass': Compass,
  'sunrise': Sunrise,
  
  // Events
  'wine-glass': Wine,
  'art': Palette,
  'trust': Castle,
  'zen': Flower2,
  'stargazer': Star,
};

// Get icon component by ID
export function getIconComponent(iconId: string): LucideIcon {
  return iconMap[iconId] || Sparkles;
}

// Render icon with props
interface IconProps {
  iconId: string;
  className?: string;
  size?: number;
}

export function MilestoneIcon({ iconId, className = "w-5 h-5", size }: IconProps) {
  const Icon = getIconComponent(iconId);
  return <Icon className={className} size={size} />;
}
