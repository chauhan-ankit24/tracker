import { Alert, Platform } from 'react-native';

/**
 * Shows a cross-platform confirmation dialog.
 * Uses window.confirm on Web, and native Alert.alert on iOS/Android.
 */
export function showConfirmAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'OK',
  cancelText = 'Cancel'
) {
  if (Platform.OS === 'web') {
    const yes = window.confirm(`${title}\n\n${message}`);
    if (yes) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
}
