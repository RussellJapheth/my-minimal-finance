<script>
    import { financeStore } from "$lib/stores/finance.svelte";
    import { formatCurrency, formatDate } from "$lib/utils";
    import TransactionModal from "$lib/components/TransactionModal.svelte";

    let filterType = $state("all"); // 'all' | 'income' | 'expense'
    let filterCategory = $state("all");

    let selectedTransaction = $state(null);
    let showModal = $state(false);

    let filteredTransactions = $derived(
        financeStore.transactions.filter((t) => {
            if (filterType !== "all" && t.type !== filterType) return false;
            if (filterCategory !== "all" && t.categoryId !== filterCategory)
                return false;
            return true;
        }),
    );

    function getCategoryName(id) {
        const cat = financeStore.categories.find((c) => c.id === id);
        return cat ? cat.name : "Unknown";
    }

    function openEditModal(t) {
        selectedTransaction = t;
        showModal = true;
    }

    function handleCloseModal() {
        showModal = false;
        selectedTransaction = null;
    }
</script>

<div class="flex-1 flex flex-col h-full bg-neutral-50 relative">
    <!-- Header -->
    <header
        class="bg-white p-6 border-b border-neutral-100 z-10 shrink-0 flex flex-col gap-4 sticky top-0"
    >
        <div class="flex items-center gap-4">
            <a
                href="/"
                class="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors"
                aria-label="Go Back"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
                >
            </a>
            <h1 class="text-2xl font-bold text-neutral-900">Transactions</h1>
        </div>

        <!-- Filters -->
        <div class="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
                class="px-5 py-2 rounded-full text-sm font-semibold shrink-0 transition-colors {filterType ===
                'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}"
                onclick={() => (filterType = "all")}
            >
                All
            </button>
            <button
                class="px-5 py-2 rounded-full text-sm font-semibold shrink-0 transition-colors {filterType ===
                'income'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}"
                onclick={() => {
                    filterType = "income";
                    filterCategory = "all";
                }}
            >
                Income
            </button>
            <button
                class="px-5 py-2 rounded-full text-sm font-semibold shrink-0 transition-colors {filterType ===
                'expense'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}"
                onclick={() => {
                    filterType = "expense";
                    filterCategory = "all";
                }}
            >
                Expense
            </button>
        </div>

        {#if filterType !== "all"}
            <div class="flex gap-2 overflow-x-auto pb-1 hide-scrollbar mt-1">
                <button
                    class="px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors {filterCategory ===
                    'all'
                        ? 'bg-neutral-200 text-neutral-800'
                        : 'bg-white border border-neutral-200 text-neutral-500'}"
                    onclick={() => (filterCategory = "all")}
                >
                    All Categories
                </button>
                {#each financeStore.categories.filter((c) => c.type === filterType || c.type === "both") as c}
                    <button
                        class="px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors {filterCategory ===
                        c.id
                            ? 'bg-neutral-200 text-neutral-800'
                            : 'bg-white border border-neutral-200 text-neutral-500'}"
                        onclick={() => (filterCategory = c.id)}
                    >
                        {c.name}
                    </button>
                {/each}
            </div>
        {/if}
    </header>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-6 pb-24">
        {#if !financeStore.isLoaded}
            <div class="animate-pulse space-y-3">
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
            </div>
        {:else if filteredTransactions.length === 0}
            <div
                class="text-center py-16 text-neutral-500 bg-white rounded-3xl border border-neutral-100 border-dashed"
            >
                <div class="text-4xl mb-3">🔍</div>
                <p class="font-medium text-neutral-700">
                    No transactions found
                </p>
                <p class="text-sm mt-1">Try adjusting your filters</p>
            </div>
        {:else}
            <div class="space-y-3">
                {#each filteredTransactions as t (t.id)}
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
        onclick={() => {
            selectedTransaction = null;
            showModal = true;
        }}
        aria-label="Add Transaction"
    >
        +
    </button>
</div>

{#if showModal}
    <TransactionModal
        initialTransaction={selectedTransaction}
        onClose={handleCloseModal}
    />
{/if}

<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .hide-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
    }
</style>
