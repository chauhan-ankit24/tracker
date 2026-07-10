import { ViewStyle } from 'react-native';

import { colors } from './colors';

/**
 * The app's elevation scale — a single source of truth for shadows so every
 * surface at the same "height" casts an identical shadow. Replaces the
 * hand-tuned shadow objects that had drifted apart across the codebase.
 *
 *   sm — list rows, chips, small interactive surfaces
 *   md — standard cards and input surfaces
 *   lg — modals, popovers, hero surfaces that float above content
 */
export const shadows = {
  sm: {
    shadowColor: colors.ink[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: colors.ink[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.ink[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
} satisfies Record<string, ViewStyle>;

/**
 * A soft brand-tinted glow for the primary CTA and hero surfaces (e.g. the
 * streak banner) where a coloured shadow reinforces emphasis.
 */
export function brandShadow(color: string = colors.saffron[500]): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  };
}
