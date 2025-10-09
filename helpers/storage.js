import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@GeoRemindData';

/**
 * Carrega listas do AsyncStorage.
 * @returns {Promise<Array>} []
 */
export async function loadLists() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Erro ao carregar listas:', err);
    return [];
  }
}

/**
 * Salva listas no AsyncStorage.
 * @param {Array} lists
 */
export async function saveLists(lists) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (err) {
    console.error('Erro ao salvar listas:', err);
  }
}
