import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import GEOFENCE_TASK from '../utils/geofencingTask';

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
    // 1️⃣ Solicita permissões de localização
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

    // 2️⃣ Verifica se já está ativo
    const registered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK);
    if (!registered) {
      console.log('🧭 Registrando tarefa de geofencing...');
    }

    // 3️⃣ Cria o geofence
    await Location.startGeofencingAsync(GEOFENCE_TASK, [
      {
        identifier,
        latitude,
        longitude,
        radius,
        notifyOnEnter: true,
        notifyOnExit: false,
      },
    ]);

    console.log(`✅ Geofencing iniciado para "${identifier}" em (${latitude}, ${longitude})`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete ativado 📍',
        body: `O lembrete de localização "${identifier}" foi ativado com sucesso.`,
      },
      trigger: null,
    });
  } catch (err) {
    console.error('Erro ao iniciar geofencing:', err);
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
