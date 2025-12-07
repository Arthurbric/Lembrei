// helpers/lists.js

/**
 * Normaliza o objeto de notificação.
 * Tipos:
 *  - none
 *  - time -> { type:'time', dateISO:string } // ex: '2025-01-30T18:30:00.000Z'
 *  - location -> { type:'location', place:string, radius:number } // radius em metros
 */
function normalizeNotification(notification) {
  const base = { type: 'none' };

  if (!notification || typeof notification !== 'object' || !notification.type)
    return base;

  if (notification.type === 'time') {
    const iso =
      typeof notification.dateISO === 'string' &&
      !isNaN(Date.parse(notification.dateISO))
        ? notification.dateISO
        : '';
    return { type: 'time', dateISO: iso };
  }

  if (notification.type === 'location') {
    const place = (notification.place || '').trim();
    const radius = Number(notification.radius) > 0 ? Number(notification.radius) : 500;

    const latitude =
      typeof notification.latitude === 'number' ? notification.latitude : null;
    const longitude =
      typeof notification.longitude === 'number' ? notification.longitude : null;

    return {
      type: 'location',
      place,
      radius,
      latitude,
      longitude,
    };
  }

  return base;
}

/**
 * Cria uma nova lista.
 */
export function createList(title, description = '', notification = { type: 'none' }) {
  const now = new Date();
  return {
    id: `list-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    title: String(title || '').trim(),
    description: String(description || '').trim(),
    createdAt: now.toLocaleDateString('pt-BR'),
    createdAtISO: now.toISOString(),
    notification: normalizeNotification(notification),
    items: [],
  };
}

/**
 * Adiciona item a uma lista específica.
 */
export function addItemToList(lists, listId, itemName) {
  const cleanName = String(itemName || '').trim();
  if (!cleanName) return lists; // evita adicionar item vazio

  const newItem = {
    id: `item-${Date.now()}`,
    name: cleanName,
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
