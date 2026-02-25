<script>
    import { financeStore } from "$lib/stores/finance.svelte";
    import { formatCurrency } from "$lib/utils";
    import CategoryModal from "$lib/components/CategoryModal.svelte";

    let currentMonth = $state(new Date().getMonth());
    let currentYear = $state(new Date().getFullYear());

    let showModal = $state(false);
    let selectedCategory = $state(null);

    // Derive transactions for the selected month to calculate actual spend
    let monthlyTransactions = $derived(
        financeStore.transactions.filter((t) => {
            const d = new Date(t.date);
            return (
                t.type === "expense" &&
                d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear
            );
        }),
    );

    // Group actual spend by category ID
    let spendByCategory = $derived.by(() => {
        const spends = {};
        for (const t of monthlyTransactions) {
            if (!spends[t.categoryId]) {
                spends[t.categoryId] = 0;
            }
            spends[t.categoryId] += t.amount;
        }
        return spends;
    });

    // Get categories that have a budget defined
    let budgetCategories = $derived(
        financeStore.categories.filter((c) => c.budget && c.budget > 0),
    );

    // Calculate overall budget vs actual
    let totalBudget = $derived(
        budgetCategories.reduce((acc, c) => acc + c.budget, 0),
    );

    let totalActual = $derived(
        budgetCategories.reduce(
            (acc, c) => acc + (spendByCategory[c.id] || 0),
            0,
        ),
    );

    function previousMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    }

    function nextMonth() {
        const now = new Date();
        if (
            currentYear === now.getFullYear() &&
            currentMonth === now.getMonth()
        )
            return;

        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
    }

    let monthName = $derived(
        new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
        }),
    );

    function editCategoryBudget(c) {
        selectedCategory = c;
        showModal = true;
    }
</script>

<div class="flex-1 flex flex-col h-full bg-neutral-50 relative">
    <!-- Header -->
    <header
        class="bg-white p-6 border-b border-neutral-100 z-10 shrink-0 sticky top-0"
    >
        <div class="flex items-center gap-4 mb-4">
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
            <h1 class="text-2xl font-bold text-neutral-900">Budgets</h1>
        </div>

        <!-- Month Selector -->
        <div
            class="flex items-center justify-between bg-neutral-900 text-white rounded-2xl p-2 mb-4"
        >
            <button
                class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-800 transition-colors"
                onclick={previousMonth}
                aria-label="Previous Month"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"><path d="m15 18-6-6 6-6" /></svg
                >
            </button>
            <div class="font-medium">{monthName}</div>
            <button
                class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                onclick={nextMonth}
                disabled={currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear()}
                aria-label="Next Month"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"><path d="m9 18 6-6-6-6" /></svg
                >
            </button>
        </div>

        <!-- Overall Breakdown -->
        {#if budgetCategories.length > 0}
            <div class="bg-neutral-100 rounded-2xl p-4">
                <div class="flex justify-between items-end mb-2">
                    <div>
                        <div
                            class="text-xs font-semibold text-neutral-500 uppercase"
                        >
                            Total Budgeted
                        </div>
                        <div class="text-lg font-bold text-neutral-900">
                            {formatCurrency(totalActual)}
                            <span class="text-sm font-medium text-neutral-400"
                                >/ {formatCurrency(totalBudget)}</span
                            >
                        </div>
                    </div>
                </div>
                <div class="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                        class="h-full rounded-full transition-all duration-500 {totalActual >
                        totalBudget
                            ? 'bg-rose-500'
                            : 'bg-neutral-900'}"
                        style="width: {Math.min(
                            (totalActual / totalBudget) * 100,
                            100,
                        )}%"
                    ></div>
                </div>
            </div>
        {/if}
    </header>

    <div class="flex-1 overflow-y-auto p-6 pb-24">
        {#if !financeStore.isLoaded}
            <div class="flex justify-center py-20">
                <div
                    class="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"
                ></div>
            </div>
        {:else if budgetCategories.length === 0}
            <div
                class="text-center py-16 text-neutral-500 bg-white rounded-3xl border border-neutral-100 border-dashed"
            >
                <div class="text-4xl mb-3">🎯</div>
                <p class="font-medium text-neutral-700">No budgets set</p>
                <p class="text-sm mt-1">
                    Edit an expense category to set a budget
                </p>
                <a
                    href="/categories"
                    class="inline-block mt-4 px-6 py-2 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 transition-colors"
                >
                    Manage Categories
                </a>
            </div>
        {:else}
            <div class="space-y-4">
                {#each budgetCategories as c (c.id)}
                    {@const actual = spendByCategory[c.id] || 0}
                    {@const percentage = Math.min(
                        (actual / c.budget) * 100,
                        100,
                    )}
                    {@const isOverBudget = actual > c.budget}

                    <button
                        class="w-full text-left bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 active:scale-[0.98] transition-all hover:border-neutral-200"
                        onclick={() => editCategoryBudget(c)}
                    >
                        <div class="flex justify-between items-end mb-3">
                            <div>
                                <h3 class="font-bold text-neutral-900 text-lg">
                                    {c.name}
                                </h3>
                                <div
                                    class="text-sm {isOverBudget
                                        ? 'text-rose-500 font-medium'
                                        : 'text-neutral-500'}"
                                >
                                    {isOverBudget
                                        ? "Over Budget by " +
                                          formatCurrency(actual - c.budget)
                                        : formatCurrency(c.budget - actual) +
                                          " remaining"}
                                </div>
                            </div>
                            <div class="text-right">
                                <div
                                    class="font-bold {isOverBudget
                                        ? 'text-rose-600'
                                        : 'text-neutral-900'}"
                                >
                                    {formatCurrency(actual)}
                                </div>
                                <div
                                    class="text-xs font-semibold text-neutral-400"
                                >
                                    / {formatCurrency(c.budget)}
                                </div>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div
                            class="h-2.5 bg-neutral-100 rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full rounded-full transition-all duration-500 {isOverBudget
                                    ? 'bg-rose-500'
                                    : percentage > 80
                                      ? 'bg-amber-400'
                                      : 'bg-emerald-400'}"
                                style="width: {percentage}%"
                            ></div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

{#if showModal}
    <CategoryModal
        initialCategory={selectedCategory}
        onClose={() => (showModal = false)}
    />
{/if}
