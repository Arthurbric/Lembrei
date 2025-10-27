import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { ToastAndroid, Platform, Alert } from 'react-native';

const GEOFENCE_TASK = 'LIMBREI_GEOFENCE_TASK';

function showMessage(msg) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('Lembrei', msg);
}

TaskManager.defineTask(GEOFENCE_TASK, async ({ data: { eventType, region }, error }) => {
  if (error) {
    console.error('Erro no geofencing:', error);
    return;
  }

  if (eventType === TaskManager.LocationGeofencingEventType.Enter) {
    showMessage(`📍 Você chegou perto de "${region.identifier.split('-')[0]}"`);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📍 Lembrete: ${region.identifier.split('-')[0]}`,
        body: `Você está próximo do local configurado para essa lista.`,
        data: { region },
      },
      trigger: null,
    });
  }
});

export default GEOFENCE_TASK;
