<script>
    import { financeStore } from "$lib/stores/finance.svelte";
    import { formatCurrency, formatDate } from "$lib/utils";
    import TransactionModal from "$lib/components/TransactionModal.svelte";

    let showAddModal = $state(false);
    let selectedTransaction = $state(null);

    let recentTransactions = $derived(financeStore.transactions.slice(0, 10));

    function getCategoryName(id) {
        const cat = financeStore.categories.find((c) => c.id === id);
        return cat ? cat.name : "Unknown";
    }

    function openEditModal(t) {
        selectedTransaction = t;
        showAddModal = true;
    }

    function handleCloseModal() {
        showAddModal = false;
        selectedTransaction = null;
    }
</script>

<div class="flex-1 flex flex-col h-full bg-neutral-50 relative">
    <!-- Header / Balance Area -->
    <header
        class="bg-neutral-900 text-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm z-10 shrink-0"
    >
        <div class="flex justify-between items-start mb-1">
            <h1 class="text-sm font-medium text-neutral-400">Total Balance</h1>
            <a
                href="/settings"
                class="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
                aria-label="Settings"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    ><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path
                        d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                    /><path d="M12 2v2" /><path d="M12 20v2" /><path
                        d="m4.93 4.93 1.41 1.41"
                    /><path d="m17.66 17.66 1.41 1.41" /><path
                        d="M2 12h2"
                    /><path d="M20 12h2" /><path
                        d="m6.34 17.66-1.41 1.41"
                    /><path d="m19.07 4.93-1.41 1.41" /></svg
                >
            </a>
        </div>
        <div class="text-4xl font-bold tracking-tight mb-8">
            {formatCurrency(financeStore.balance)}
        </div>

        <div class="flex gap-4">
            <a
                href="/insights?type=income"
                class="flex-1 bg-neutral-800 rounded-2xl p-4 shadow-inner active:bg-neutral-700 transition-colors block text-left"
            >
                <div
                    class="text-xs text-neutral-400 mb-1 font-medium tracking-wide uppercase flex justify-between items-center"
                >
                    Income
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"><path d="m9 18 6-6-6-6" /></svg
                    >
                </div>
                <div class="text-lg font-semibold text-emerald-400">
                    {formatCurrency(financeStore.totalIncomeMonth)}
                </div>
            </a>
            <a
                href="/insights?type=expense"
                class="flex-1 bg-neutral-800 rounded-2xl p-4 shadow-inner active:bg-neutral-700 transition-colors block text-left"
            >
                <div
                    class="text-xs text-neutral-400 mb-1 font-medium tracking-wide uppercase flex justify-between items-center"
                >
                    Expense
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"><path d="m9 18 6-6-6-6" /></svg
                    >
                </div>
                <div class="text-lg font-semibold text-rose-400">
                    {formatCurrency(financeStore.totalExpenseMonth)}
                </div>
            </a>
        </div>

        <a
            href="/budgets"
            class="mt-4 bg-neutral-800 rounded-2xl p-4 shadow-inner active:bg-neutral-700 transition-colors flex justify-between items-center text-left w-full group"
        >
            <div
                class="font-medium text-neutral-300 group-hover:text-white transition-colors"
            >
                Monthly Budgets
            </div>
            <div
                class="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-400 group-hover:bg-neutral-600 transition-colors"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
                >
            </div>
        </a>
    </header>

    <!-- Recent Transactions -->
    <div class="flex-1 overflow-y-auto p-6 pb-24">
        <div class="flex justify-between items-end mb-4">
            <h2 class="text-lg font-semibold text-neutral-800">
                Recent Transactions
            </h2>
            <a
                href="/transactions"
                class="text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
                >See All</a
            >
        </div>

        {#if !financeStore.isLoaded}
            <div class="animate-pulse space-y-3 pt-2">
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
            </div>
        {:else if recentTransactions.length === 0}
            <div
                class="text-center py-12 text-neutral-500 bg-white rounded-3xl border border-neutral-100 border-dashed"
            >
                <div class="text-4xl mb-3">👛</div>
                <p class="font-medium text-neutral-700">No transactions</p>
                <p class="text-sm mt-1">Tap + to add your first entry</p>
            </div>
        {:else}
            <div class="space-y-3">
                {#each recentTransactions as t (t.id)}
                    <button
                        class="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between active:scale-[0.98] transition-all hover:bg-neutral-50"
                        onclick={() => openEditModal(t)}
                    >
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 rounded-full flex justify-center items-center text-xl shrink-0 {t.type ===
                                'income'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-rose-50 text-rose-600'}"
                            >
                                {t.type === "income" ? "↓" : "↑"}
                            </div>
                            <div class="min-w-0 pr-2">
                                <div
                                    class="font-semibold text-neutral-900 truncate"
                                >
                                    {getCategoryName(t.categoryId)}
                                </div>
                                <div
                                    class="text-xs text-neutral-500 truncate mt-0.5"
                                >
                                    {formatDate(t.date)}
                                    {t.note ? `· ${t.note}` : ""}
                                </div>
                            </div>
                        </div>
                        <div
                            class="font-bold shrink-0 {t.type === 'income'
                                ? 'text-emerald-600'
                                : 'text-neutral-900'}"
                        >
                            {t.type === "income" ? "+" : "-"}{formatCurrency(
                                t.amount,
                            )}
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <!-- FAB -->
    <button
        class="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-neutral-900 text-white rounded-full shadow-xl flex justify-center items-center text-4xl font-light hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all z-20"
        onclick={() => (showAddModal = true)}
        aria-label="Add Transaction"
    >
        +
    </button>
</div>

{#if showAddModal}
    <TransactionModal
        initialTransaction={selectedTransaction}
        onClose={handleCloseModal}
    />
{/if}
