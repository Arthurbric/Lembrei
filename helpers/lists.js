// helpers/lists.js

/**
 * Normaliza o objeto de notificação.
 * Tipos:
 *  - none
 *  - time   -> { type:'time', dateISO:string }  // ex: '2025-01-30T18:30:00.000Z'
 *  - location -> { type:'location', place:string, radius:number } // radius em metros
 */
function normalizeNotification(notification) {
  const base = { type: 'none' };

  if (!notification || !notification.type) return base;

  if (notification.type === 'time') {
    // Garante string ISO válida
    const iso = typeof notification.dateISO === 'string' ? notification.dateISO : '';
    return { type: 'time', dateISO: iso };
  }

  if (notification.type === 'location') {
    const place = (notification.place || '').trim();
    const radius = Number.isFinite(notification.radius) ? Number(notification.radius) : 500; // default 500m
    return { type: 'location', place, radius };
  }

  return base;
}

/**
 * Cria uma nova lista.
 */
export function createList(title, description = '', notification = { type: 'none' }) {
  return {
    id: `list-${Date.now()}`,
    title: String(title || '').trim(),
    description: String(description || '').trim(),
    createdAt: new Date().toLocaleDateString('pt-BR'),
    notification: normalizeNotification(notification),
    items: [],
  };
}

/**
 * Adiciona item a uma lista específica.
 */
export function addItemToList(lists, listId, itemName) {
  const newItem = {
    id: `item-${Date.now()}`,
    name: String(itemName || '').trim(),
    quantity: 1,
    completed: false,
  };

  return lists.map((list) =>
    list.id === listId ? { ...list, items: [...list.items, newItem] } : list
  );
}

/**
 * Alterna completed de um item.
 */
export function toggleItem(lists, listId, itemId) {
  return lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((it) =>
            it.id === itemId ? { ...it, completed: !it.completed } : it
          ),
        }
      : list
  );
}

/**
 * Remove uma lista por id.
 */
export function removeList(lists, listId) {
  return lists.filter((list) => list.id !== listId);
}

/**
 * Remove um item de uma lista.
 */
export function removeItem(lists, listId, itemId) {
  return lists.map((list) =>
    list.id === listId
      ? { ...list, items: list.items.filter((it) => it.id !== itemId) }
      : list
  );
}
