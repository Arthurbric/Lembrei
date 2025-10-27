// helpers/geofencing.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import GEOFENCE_TASK from '../utils/geofencingTask';

/**
 * Inicializa o canal padrão para notificações Android (obrigatório)
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
 * Inicia um geofence para lembrar o usuário quando ele estiver próximo de um local.
 * @param {Object} params
 * @param {string} params.identifier - Nome do local (ex: "Supermercado")
 * @param {number} params.latitude - Latitude do ponto
 * @param {number} params.longitude - Longitude do ponto
 * @param {number} params.radius - Raio da região em metros (ex: 200)
 */
export async function startGeofence({ identifier, latitude, longitude, radius = 300 }) {
  try {
    await setupNotificationChannel();

    // 1️⃣ Permissões de localização
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

    // 2️⃣ Verifica e registra a task se necessário
    const registered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
    if (!registered) {
      console.log('🧭 Registrando tarefa de geofencing...');
    }

    // 3️⃣ Cria identificador único
    const uniqueId = `${identifier}-${Date.now()}`;

    // 4️⃣ Cria o geofence
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
          notificationBody: `Monitorando a área da lista "${identifier}" (${radius}m)`,
          notificationColor: '#7159c1',
        },
      }
    );

    console.log(`✅ Geofencing iniciado para "${identifier}" em (${latitude}, ${longitude})`);

    // 5️⃣ Notificação e alerta de feedback
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🛰️ Geofencing ativo`,
        body: `Monitorando a área de ${radius}m em torno de "${identifier}".`,
      },
      trigger: null,
    });

    alert(`🛰️ Geofencing ativo!\nAguardando proximidade de "${identifier}" (raio de ${radius}m).`);
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
