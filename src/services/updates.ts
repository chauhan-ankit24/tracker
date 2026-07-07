import { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Checks for an over-the-air (EAS Update) release on cold start and whenever the
 * app returns to the foreground. If one is found it's downloaded, then the user
 * is offered a restart to apply it.
 *
 * No-ops in development / Expo Go (Updates.isEnabled is false there), so it's
 * safe to always mount.
 */
export function useOTAUpdates() {
  // Avoid prompting repeatedly for the same downloaded update.
  const promptedRef = useRef(false);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    const checkForUpdate = async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable || promptedRef.current) return;

        await Updates.fetchUpdateAsync();
        promptedRef.current = true;

        Alert.alert(
          'Update available',
          'A new version of Bhakti Tracker is ready. Restart to apply it now?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Restart',
              onPress: async () => {
                try {
                  await Updates.reloadAsync();
                } catch {
                  /* ignore — will apply on next launch */
                }
              },
            },
          ],
        );
      } catch {
        // Offline or update server unreachable — try again next foreground.
      }
    };

    checkForUpdate();

    const onChange = (state: AppStateStatus) => {
      if (state === 'active') checkForUpdate();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}
