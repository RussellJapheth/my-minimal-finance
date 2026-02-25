const DB_NAME = "personal-finance-db";
const DB_VERSION = 1;

export const CATEGORIES_STORE = "categories";
export const TRANSACTIONS_STORE = "transactions";

const DEFAULT_CATEGORIES = [
    { id: "cat-food", name: "Food", type: "expense", isDefault: true },
    {
        id: "cat-transport",
        name: "Transport",
        type: "expense",
        isDefault: true,
    },
    { id: "cat-bills", name: "Bills", type: "expense", isDefault: true },
    { id: "cat-rent", name: "Rent", type: "expense", isDefault: true },
    { id: "cat-subs", name: "Subscriptions", type: "expense", isDefault: true },
    { id: "cat-misc", name: "Miscellaneous", type: "expense", isDefault: true },
    { id: "cat-salary", name: "Salary", type: "income", isDefault: true },
    { id: "cat-business", name: "Business", type: "income", isDefault: true },
    { id: "cat-gift", name: "Gift", type: "income", isDefault: true },
    { id: "cat-other-income", name: "Other", type: "income", isDefault: true },
];

let dbPromise = null;

export function initDB() {
    if (typeof window === "undefined") return Promise.resolve(null);

    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
                const categoriesStore = db.createObjectStore(CATEGORIES_STORE, {
                    keyPath: "id",
                });
                categoriesStore.createIndex("type", "type", { unique: false });

                // Seed default categories
                const now = new Date().toISOString();
                DEFAULT_CATEGORIES.forEach((cat) => {
                    categoriesStore.add({ ...cat, createdAt: now });
                });
            }

            if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
                const transactionsStore = db.createObjectStore(
                    TRANSACTIONS_STORE,
                    { keyPath: "id" },
                );
                transactionsStore.createIndex("date", "date", {
                    unique: false,
                });
                transactionsStore.createIndex("type", "type", {
                    unique: false,
                });
                transactionsStore.createIndex("categoryId", "categoryId", {
                    unique: false,
                });
            }
        };
    });

    return dbPromise;
}

export async function getAll(storeName) {
    const db = await initDB();
    if (!db) return [];
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getById(storeName, id) {
    const db = await initDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function add(storeName, item) {
    const db = await initDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => resolve(item);
        request.onerror = () => reject(request.error);
    });
}

export async function update(storeName, item) {
    const db = await initDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve(item);
        request.onerror = () => reject(request.error);
    });
}

export async function remove(storeName, id) {
    const db = await initDB();
    if (!db) return false;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

export async function clearAll(storeName) {
    const db = await initDB();
    if (!db) return false;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}
