// ============================================================
// DEMO STORAGE — All data persisted in localStorage only.
// No backend, Prisma, JWT, or API calls.
// ============================================================

export type StorageKey = 'bills' | 'insurance' | 'subscriptions' | 'reminders' | 'documents';

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getAll<T>(key: StorageKey): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

export function saveAll<T>(key: StorageKey, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export function addItem<T extends { id?: string }>(key: StorageKey, item: T): T {
  const items = getAll<T>(key);
  const newItem = { ...item, id: genId(), createdAt: new Date().toISOString() };
  items.push(newItem as T);
  saveAll(key, items);
  return newItem as T;
}

export function updateItem<T extends { id: string }>(key: StorageKey, id: string, updates: Partial<T>): T | null {
  const items = getAll<T>(key);
  const index = items.findIndex((i: any) => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  saveAll(key, items);
  return items[index];
}

export function deleteItem<T extends { id: string }>(key: StorageKey, id: string): void {
  const items = getAll<T>(key);
  saveAll(key, items.filter((i: any) => i.id !== id));
}
