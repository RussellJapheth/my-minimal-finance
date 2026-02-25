import {
    getAll,
    add,
    update,
    remove,
    clearAll,
    CATEGORIES_STORE,
    TRANSACTIONS_STORE,
} from "$lib/db/indexeddb";

export const financeStore = createFinanceStore();

function createFinanceStore() {
    let categories = $state([]);
    let transactions = $state([]);
    let isLoaded = $state(false);

    async function loadData() {
        if (typeof window === "undefined") return;
        try {
            categories = await getAll(CATEGORIES_STORE);
            transactions = await getAll(TRANSACTIONS_STORE);

            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            isLoaded = true;
        } catch (e) {
            console.error("Failed to load data from DB", e);
        }
    }

    async function addTransaction(t) {
        const saved = await add(TRANSACTIONS_STORE, t);
        transactions = [saved, ...transactions].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
        );
        return saved;
    }

    async function updateTransaction(t) {
        const saved = await update(TRANSACTIONS_STORE, t);
        transactions = transactions
            .map((x) => (x.id === t.id ? saved : x))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        return saved;
    }

    async function removeTransaction(id) {
        await remove(TRANSACTIONS_STORE, id);
        transactions = transactions.filter((x) => x.id !== id);
    }

    async function addCategory(c) {
        const saved = await add(CATEGORIES_STORE, c);
        categories = [...categories, saved];
        return saved;
    }

    async function updateCategory(c) {
        const saved = await update(CATEGORIES_STORE, c);
        categories = categories.map((x) => (x.id === c.id ? saved : x));
        return saved;
    }

    async function removeCategory(id) {
        await remove(CATEGORIES_STORE, id);
        categories = categories.filter((x) => x.id !== id);
    }

    async function importData(importedCategories, importedTransactions) {
        await clearAll(CATEGORIES_STORE);
        await clearAll(TRANSACTIONS_STORE);

        for (const c of importedCategories) await add(CATEGORIES_STORE, c);
        for (const t of importedTransactions) await add(TRANSACTIONS_STORE, t);

        await loadData();
    }

    let balance = $derived(
        transactions.reduce(
            (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
            0,
        ),
    );

    let totalIncomeMonth = $derived(
        transactions
            .filter((t) => {
                const d = new Date(t.date);
                const now = new Date();
                return (
                    t.type === "income" &&
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                );
            })
            .reduce((acc, t) => acc + t.amount, 0),
    );

    let totalExpenseMonth = $derived(
        transactions
            .filter((t) => {
                const d = new Date(t.date);
                const now = new Date();
                return (
                    t.type === "expense" &&
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                );
            })
            .reduce((acc, t) => acc + t.amount, 0),
    );

    return {
        get categories() {
            return categories;
        },
        get transactions() {
            return transactions;
        },
        get isLoaded() {
            return isLoaded;
        },
        get balance() {
            return balance;
        },
        get totalIncomeMonth() {
            return totalIncomeMonth;
        },
        get totalExpenseMonth() {
            return totalExpenseMonth;
        },
        loadData,
        addTransaction,
        updateTransaction,
        removeTransaction,
        addCategory,
        updateCategory,
        removeCategory,
        importData,
    };
}
