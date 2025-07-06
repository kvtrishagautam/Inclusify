import { chromophobiaModel, type ChromophobiaSettings, type ColorMode } from "./models/ChromophobiaModel";

// Re-export types for backward compatibility
export type { ChromophobiaSettings, ColorMode };

// Export the settings store for backward compatibility
export const chromophobiaSettings = chromophobiaModel.getSettings();

// Compatibility layer for backward compatibility
// This file maintains the old API while using the new MVC architecture

// Legacy persistentStore function for backward compatibility
import { writable, type Updater, type Writable } from "svelte/store";

/**
 * Creates a persistent Svelte store backed by Chrome's sync storage.
 * Note that each item is limited to 8KB. Use storage.local for larger amounts.
 * https://developer.chrome.com/docs/extensions/reference/api/storage#storage_areas
 *
 * @template T The type of the store's value
 * @param key The key to use in Chrome's storage
 * @param initialValue The initial value of the store
 * @returns A writable Svelte store
 */
export function persistentStore<T>(key: string, initialValue: T): Writable<T> {
    const store = writable<T>(initialValue);

    function updateChromeStorage(value: T): void {
        chrome.storage.sync.set({ [key]: value });
    }

    function watchChromeStorage() {
        chrome.storage.sync.onChanged.addListener((changes) => {
            if (Object.hasOwn(changes, key)) {
                store.set(changes[key].newValue);
            }
        });
    }

    function initStoreFromChromeStorage() {
        chrome.storage.sync.get(key).then((result) => {
            if (Object.hasOwn(result, key)) {
                store.set(result[key]);
            }
        });
    }

    initStoreFromChromeStorage();
    watchChromeStorage();

    return {
        set(this: void, value: T): void {
            store.set(value);
            updateChromeStorage(value);
        },
        update(this: void, updater: Updater<T>): void {
            return store.update((prev: T): T => {
                const value = updater(prev);
                updateChromeStorage(value);
                return value;
            });
        },
        subscribe: store.subscribe,
    };
}

// Legacy count store for backward compatibility
export const count = persistentStore("count", 10);
