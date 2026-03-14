export const STORAGE_KEYS = {
  LOCATIONS: 'tour_locations',
  KNOWLEDGE: 'tour_knowledge',
  USER_ID: 'tour_user_id',
  IS_PAID: 'tour_is_paid',
  EXPIRES_AT: 'tour_expires_at',
};

export function saveToStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Storage save error:', error);
  }
}

export function getFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
