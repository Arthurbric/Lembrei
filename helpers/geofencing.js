// helpers/geofencing.js
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import '../utils/geofencingTask.js';

export const GEOFENCE_TASK = 'LEMBREI_GEOFENCE_TASK';

// Canal Android
export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
    });
  }
}

// Distância entre dois pontos (Haversine)
function haversineDistance(a, b) {
  const R = 6371e3;
  const φ1 = a.lat * Math.PI / 180;
  const φ2 = b.lat * Math.PI / 180;
  const Δφ = (b.lat - a.lat) * Math.PI / 180;
  const Δλ = (b.lon - a.lon) * Math.PI / 180;

  const x =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// Inicia um Geofence
export async function startGeofence({ identifier, listName, latitude, longitude, radius = 300 }) {
  try {
    await setupNotificationChannel();

    // Permissões
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') return alert("Permissão de localização negada.");

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') return alert("Permissão em segundo plano negada.");

    // Verifica se a task existe
    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
    if (!isRegistered) {
      console.warn("⚠ Task não registrada! Verifique import no App.js");
    }

    const uniqueId = `${identifier}-${Date.now()}`;

    // REGISTRA O GEOFENCE
    await Location.startGeofencingAsync(
      GEOFENCE_TASK,
      [
        {
          identifier: uniqueId,
          latitude,
          longitude,
          radius,
          notifyOnEnter: true,
          notifyOnExit: false,
          metadata: {
            listName, // AGORA O NOME ESTÁ CERTO
          },
        },
      ],
      {
        foregroundService: {
          notificationTitle: "Lembrei — Geofencing ativo",
          notificationBody: `Monitorando "${listName}" (${radius}m)`,
          notificationColor: "#7159c1",
        },
      }
    );

    console.log(`✅ Geofencing iniciado para "${listName}"`);

    // Feedback
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🛰️ Monitoramento ativo",
        body: `A lista "${listName}" está sendo monitorada.`,
      },
      trigger: null,
    });

    // Notificação imediata se já estiver dentro da região
    const current = await Location.getCurrentPositionAsync({});
    const distance = haversineDistance(
      { lat: current.coords.latitude, lon: current.coords.longitude },
      { lat: latitude, lon: longitude }
    );

    console.log(`📏 Distância atual até "${listName}": ${distance.toFixed(1)}m`);

    if (distance <= radius) {
      console.log("📍 Dentro da área! Notificação imediata.");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 Lembrete: ${listName}`,
          body: `Você já está no local configurado.`,
        },
        trigger: null,
      });
    }

  } catch (err) {
    console.error("❌ Erro ao iniciar geofencing:", err);
    alert("Erro ao ativar geofencing.");
  }
}

// Parar todos os geofences
export async function stopAllGeofences() {
  try {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
    console.log("🛑 Geofencing desativado.");
  } catch (err) {
    console.error("Erro ao parar geofencing:", err);
  }
}
