// utils/geofencingTask.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { ToastAndroid, Platform, Alert } from 'react-native';

export const GEOFENCE_TASK = 'LEMBREI_GEOFENCE_TASK';

function showMessage(msg) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert('Lembrei', msg);
}

TaskManager.defineTask(GEOFENCE_TASK, async ({ data: { eventType, region }, error }) => {
  if (error) {
    console.error('Erro no geofencing:', error);
    return;
  }

  console.log('📡 Evento geofence detectado:', eventType, region);

  if (eventType === TaskManager.LocationGeofencingEventType.Enter) {
    showMessage(`📍 Você chegou perto de "${region.identifier.split('-')[0]}"`);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📍 Lembrete: ${region.identifier.split('-')[0]}`,
        body: 'Você está próximo do local configurado.',
      },
      trigger: null,
    });
  }
});
