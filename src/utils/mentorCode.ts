// Unambiguous alphabet — no 0/O, 1/I/L to avoid confusion when sharing.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

/** Generates a random short mentor code, e.g. "K7M2QP". */
export function generateMentorCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/** Normalizes user-entered codes (trim, uppercase). */
export function normalizeMentorCode(input: string): string {
  return input.trim().toUpperCase();
}
