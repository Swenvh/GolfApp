import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Kleine tastbare bevestigingen; stil op web en als het toestel het niet ondersteunt. */
export const haptic = {
  tap: () => { if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {}); },
  success: () => { if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); },
  warn: () => { if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); },
};
