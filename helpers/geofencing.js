// helpers/geofencing.js
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import '../utils/geofencingTask.js';


// ⚠ NÃO importar default do geofencingTask (era só a string!)
// Agora importamos APENAS o nome da task:
export const GEOFENCE_TASK = 'LEMBREI_GEOFENCE_TASK';

/**
 * Configura canal Android (obrigatório)
 */
export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
    });
  }
}

/**
 * Função utilitária: calcula distância entre 2 pontos (Haversine)
 */
function haversineDistance(a, b) {
  const R = 6371e3; // metros
  const φ1 = a.lat * Math.PI / 180;
  const φ2 = b.lat * Math.PI / 180;
  const Δφ = (b.lat - a.lat) * Math.PI / 180;
  const Δλ = (b.lon - a.lon) * Math.PI / 180;

  const x =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Inicia o geofence
 */
export async function startGeofence({ identifier, latitude, longitude, radius = 300 }) {
  try {
    await setupNotificationChannel();

    // Permissões de localização
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
      alert('Permissão de localização negada.');
      return;
    }

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') {
      alert('Permissão de localização em segundo plano negada.');
      return;
    }

    // Verifica se a task existe
    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
    if (!isRegistered) {
      console.log('⚠ A task ainda não foi registrada! Verifique import no App.js.');
    }

    // Criar identificador único por lista
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
        },
      ],
      {
        foregroundService: {
          notificationTitle: 'Lembrei — Geofencing ativo',
          notificationBody: `Monitorando a área de "${identifier}" (${radius}m)`,
          notificationColor: '#7159c1',
        },
      }
    );

    console.log(`✅ Geofencing iniciado para "${identifier}"`);

    // Feedback
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🛰️ Geofencing ativo',
        body: `O app está monitorando a área de "${identifier}".`,
      },
      trigger: null,
    });

    // ⚠ Dispara notificação imediata se já estiver dentro da área
    const current = await Location.getCurrentPositionAsync({});
    const distance = haversineDistance(
      { lat: current.coords.latitude, lon: current.coords.longitude },
      { lat: latitude, lon: longitude }
    );

    console.log(`📏 Distância atual até "${identifier}": ${distance.toFixed(1)}m`);

    if (distance <= radius) {
      console.log('📍 Usuário JÁ ESTÁ dentro da região. Disparando ENTER imediato.');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 Lembrete: ${identifier}`,
          body: `Você já está no local configurado.`,
        },
        trigger: null,
      });
    }

  } catch (err) {
    console.error('❌ Erro ao iniciar geofencing:', err);
    alert('Erro ao ativar lembrete de localização.');
  }
}

/**
 * Cancela todos os geofences ativos
 */
export async function stopAllGeofences() {
  try {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
    console.log('🛑 Todos os geofences foram desativados.');
  } catch (err) {
    console.error('Erro ao parar geofencing:', err);
  }
}
