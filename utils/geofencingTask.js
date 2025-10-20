import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const GEOFENCE_TASK = 'LIMBREI_GEOFENCE_TASK';

TaskManager.defineTask(GEOFENCE_TASK, async ({ data: { eventType, region }, error }) => {
  if (error) {
    console.error('Erro no geofencing:', error);
    return;
  }

  if (eventType === TaskManager.LocationGeofencingEventType.Enter) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete de Localização 🧠',
        body: `Você chegou perto de ${region.identifier}`,
      },
      trigger: null,
    });
  }
});

export default GEOFENCE_TASK;
