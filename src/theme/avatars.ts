import { Ionicons } from '@expo/vector-icons';

export interface AvatarPreset {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
}

/**
 * A small, calm set of predefined avatars — peaceful symbols on muted colors.
 * Stored by `id` on the user profile; rendering is fully vector (no assets).
 */
export const AVATARS: AvatarPreset[] = [
  { id: 'lotus', icon: 'flower', bg: '#EC8420' },
  { id: 'leaf', icon: 'leaf', bg: '#4FA771' },
  { id: 'flame', icon: 'flame', bg: '#D66E12' },
  { id: 'book', icon: 'book', bg: '#4C8DD6' },
  { id: 'sun', icon: 'sunny', bg: '#E6A817' },
  { id: 'moon', icon: 'moon', bg: '#7C6BD9' },
  { id: 'star', icon: 'star', bg: '#E76F8E' },
  { id: 'water', icon: 'water', bg: '#2FA6A0' },
  { id: 'kirtan', icon: 'musical-notes', bg: '#B0763F' },
  { id: 'peace', icon: 'sparkles', bg: '#6B7A99' },
];

export function getAvatar(id?: string): AvatarPreset | undefined {
  return id ? AVATARS.find((a) => a.id === id) : undefined;
}
