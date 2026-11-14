/** Kho ảnh trên IndexedDB (chỉ chạy trong trình duyệt). Ảnh không bao giờ gửi lên server. */
import type { PhotoData, PhotoStore } from './save';

const DB = 'htx-photos', STORE = 'photos';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class IdbPhotoStore implements PhotoStore {
  private db: Promise<IDBDatabase> | null = null;
  private run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    this.db ??= open();
    return this.db.then((db) => new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }
  async put(key: string, data: PhotoData) { await this.run('readwrite', (s) => s.put(data, key)); }
  async get(key: string) { return (await this.run<PhotoData | undefined>('readonly', (s) => s.get(key))) ?? null; }
  async delete(key: string) { await this.run('readwrite', (s) => s.delete(key)); }
  async keys() { return (await this.run('readonly', (s) => s.getAllKeys())).map(String); }
  async clear() { await this.run('readwrite', (s) => s.clear()); }
}
