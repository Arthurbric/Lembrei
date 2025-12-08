// helpers/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateList } from './lists';

export const STORAGE_KEY = '@LimbreiLists';

/**
 * Carrega listas do AsyncStorage.
 * @returns {Promise<Array>}
 */
export async function loadLists() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ Erro ao carregar listas:', err);
    return [];
  }
}

/**
 * Salva listas no AsyncStorage.
 * @param {Array} lists
 */
export async function saveLists(lists) {
  try {
    if (!Array.isArray(lists)) throw new Error('Formato inválido de listas');
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (err) {
    console.error('❌ Erro ao salvar listas:', err);
  }
}

/**
 * Limpa todas as listas salvas.
 */
export async function clearLists() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('❌ Erro ao limpar listas:', err);
  }
}

/**
 * Atualiza uma lista pelo ID e salva no storage.
 */
export async function saveUpdatedList(listId, changes) {
  try {
    const lists = await loadLists();
    const updated = updateList(lists, listId, changes);
    await saveLists(updated);
    return updated;
  } catch (err) {
    console.error("❌ Erro ao atualizar lista:", err);
    return null;
  }
}