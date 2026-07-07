/** Read a required `EXPO_PUBLIC_*` variable (set in `.env`). */
export function env(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing ${key}. Copy .env.example to .env, fill in your values, then restart Expo.`,
    );
  }
  return value;
}

/** Read an optional `EXPO_PUBLIC_*` variable. */
export function optionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value || undefined;
}
