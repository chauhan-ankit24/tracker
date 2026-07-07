import { AppUser } from '../types';
import { isOwner } from '../config/app';

/**
 * A mentor who can access mentor features. The owner is always approved, and
 * mentors created before the approval feature (no `approved` field) are
 * grandfathered in — only accounts explicitly marked `approved: false` are
 * treated as pending.
 */
export function isApprovedMentor(user: AppUser): boolean {
  return user.role === 'admin' && (user.approved !== false || isOwner(user.id));
}

/** A mentor account still waiting on (or refused) the owner's approval. */
export function isPendingMentor(user: AppUser): boolean {
  return user.role === 'admin' && !isApprovedMentor(user);
}
