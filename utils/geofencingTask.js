// utils/geofencingTask.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

export const GEOFENCE_TASK = 'LEMBREI_GEOFENCE_TASK';

// Mensagens aleatórias ao entrar no local
const RANDOM_GEOFENCE_MESSAGES = [
  'Você chegou! Veja a lista "{{name}}" agora.',
  'Perfeito! O local da lista {{name}} foi alcançado.',
  'Parece um bom momento para abrir a lista {{name}} 😉',
  'Estamos no ponto certo! Abra a lista {{name}}.',
  'Bingo! Você está no local da lista {{name}}.',
  'Aproveite! Sua lista {{name}} está pronta para ser usada.',
  'Hora perfeita para conferir: {{name}} 📌',
  'Você marcou presença no local da lista {{name}}!',
  'Chegamos! Veja os itens da lista {{name}}.',
  'O local corresponde: hora de ver a lista {{name}}!'
];

function randomGeofenceMessage(name) {
  const msg = RANDOM_GEOFENCE_MESSAGES[Math.floor(Math.random() * RANDOM_GEOFENCE_MESSAGES.length)];
  return msg.replace('{{name}}', name);
}

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error("❌ Erro no geofencing task:", error);
    return;
  }

  const { eventType, region } = data;

  const listName = region?.metadata?.listName || "Lista";

  if (eventType === Location.GeofencingEventType.Enter) {
    console.log("📍 Entrou na região da lista:", listName);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📍 Você chegou ao local!",
        body: randomGeofenceMessage(listName),
        sound: true,
      },
      trigger: null,
    });
  }
});
