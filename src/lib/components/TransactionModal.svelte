<script>
    import { fade, fly } from "svelte/transition";
    import { financeStore } from "$lib/stores/finance.svelte";
    import { generateId } from "$lib/utils";
    import { onMount } from "svelte";

    let { onClose, initialTransaction = null } = $props();

    function getInit() {
        return initialTransaction || {};
    }

    let type = $state(getInit().type || "expense");
    let amount = $state(getInit().amount ? String(getInit().amount) : "");
    let categoryId = $state(getInit().categoryId || "");
    let note = $state(getInit().note || "");
    let date = $state(
        getInit().date
            ? getInit().date.split("T")[0]
            : new Date().toISOString().split("T")[0],
    );

    let amountInput;

    let displayAmount = $state(
        getInit().amount
            ? new Intl.NumberFormat("en-US").format(getInit().amount)
            : "",
    );

    function handleAmountInput(e) {
        // Remove non-digit characters
        let rawValue = e.target.value.replace(/\D/g, "");
        if (rawValue === "") {
            amount = "";
            displayAmount = "";
            return;
        }

        amount = rawValue;
        // Format with commas manually or with locale formatter
        displayAmount = Number(rawValue).toLocaleString("en-US");
    }

    // Smart default category
    $effect(() => {
        if (!categoryId || categoryId === "") {
            const typeCategories = financeStore.categories.filter(
                (c) => c.type === type || c.type === "both",
            );
            if (typeCategories.length > 0) {
                categoryId = typeCategories[0].id;
            }
        } else {
            // If they completely change type and current category does not match
            const currentCat = financeStore.categories.find(
                (c) => c.id === categoryId,
            );
            if (
                currentCat &&
                currentCat.type !== type &&
                currentCat.type !== "both"
            ) {
                const typeCategories = financeStore.categories.filter(
                    (c) => c.type === type || c.type === "both",
                );
                if (typeCategories.length > 0) {
                    categoryId = typeCategories[0].id;
                }
            }
        }
    });

    onMount(() => {
        // Auto-focus amount on mobile
        if (amountInput) amountInput.focus();
    });

    async function handleSave() {
        if (!amount || isNaN(amount) || amount <= 0) return;

        const tx = {
            id: initialTransaction ? initialTransaction.id : generateId(),
            amount: Number(amount),
            type,
            categoryId,
            note,
            date: new Date(date).toISOString(),
            createdAt: initialTransaction
                ? initialTransaction.createdAt
                : new Date().toISOString(),
        };

        if (initialTransaction) {
            await financeStore.updateTransaction(tx);
        } else {
            await financeStore.addTransaction(tx);
        }

        onClose();
    }
</script>

<div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    transition:fade={{ duration: 200 }}
>
    <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onclick={onClose}
        aria-hidden="true"
    ></div>

    <div
        class="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl h-[85vh] sm:h-auto sm:max-h-[90vh]"
        transition:fly={{ y: 600, duration: 300, opacity: 1 }}
    >
        <!-- Header -->
        <div
            class="flex items-center justify-between p-6 pb-2 border-b border-neutral-100"
        >
            <h2 class="text-xl font-bold text-neutral-900">
                {initialTransaction ? "Edit Transaction" : "New Transaction"}
            </h2>
            <button
                class="w-8 h-8 flex items-center justify-center text-neutral-400 bg-neutral-100 rounded-full hover:bg-neutral-200"
                onclick={onClose}>✕</button
            >
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Type Toggle -->
            <div class="flex p-1 bg-neutral-100 rounded-2xl">
                <button
                    class="flex-1 py-3 text-sm font-semibold rounded-xl transition-colors {type ===
                    'expense'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500'}"
                    onclick={() => (type = "expense")}>Expense</button
                >
                <button
                    class="flex-1 py-3 text-sm font-semibold rounded-xl transition-colors {type ===
                    'income'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500'}"
                    onclick={() => (type = "income")}>Income</button
                >
            </div>

            <!-- Amount -->
            <div class="space-y-2">
                <label
                    for="amount"
                    class="block text-sm font-medium text-neutral-500"
                    >Amount (₦)</label
                >
                <div class="relative">
                    <span
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-neutral-400"
                        >₦</span
                    >
                    <input
                        bind:this={amountInput}
                        type="text"
                        inputmode="numeric"
                        id="amount"
                        value={displayAmount}
                        oninput={handleAmountInput}
                        placeholder="0"
                        class="w-full bg-neutral-50 border-0 rounded-2xl py-4 pl-12 pr-4 text-3xl font-bold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all outline-none"
                    />
                </div>
            </div>

            <!-- Category -->
            <div class="space-y-2">
                <label
                    for="category"
                    class="block text-sm font-medium text-neutral-500"
                    >Category</label
                >
                <select
                    id="category"
                    bind:value={categoryId}
                    class="w-full bg-neutral-50 border-0 rounded-2xl p-4 text-lg font-medium text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white outline-none appearance-none"
                >
                    {#each financeStore.categories.filter((c) => c.type === type || c.type === "both") as c}
                        <option value={c.id}>{c.name}</option>
                    {/each}
                </select>
            </div>

            <!-- Note -->
            <div class="space-y-2">
                <label
                    for="note"
                    class="block text-sm font-medium text-neutral-500"
                    >Note (Optional)</label
                >
                <input
                    type="text"
                    id="note"
                    bind:value={note}
                    placeholder="What was this for?"
                    class="w-full bg-neutral-50 border-0 rounded-2xl p-4 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white outline-none"
                />
            </div>

            <!-- Date -->
            <div class="space-y-2">
                <label
                    for="date"
                    class="block text-sm font-medium text-neutral-500"
                    >Date</label
                >
                <input
                    type="date"
                    id="date"
                    bind:value={date}
                    class="w-full bg-neutral-50 border-0 rounded-2xl p-4 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white outline-none block"
                />
            </div>
        </div>

        <!-- Footer -->
        <div class="p-6 pt-2 pb-8 sm:pb-6 flex gap-3">
            {#if initialTransaction}
                <button
                    onclick={async () => {
                        if (confirm("Delete this transaction?")) {
                            await financeStore.removeTransaction(
                                initialTransaction.id,
                            );
                            onClose();
                        }
                    }}
                    class="w-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 hover:bg-rose-200 transition-colors"
                    aria-label="Delete Transaction"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        ><path d="M3 6h18" /><path
                            d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                        /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line
                            x1="10"
                            y1="11"
                            x2="10"
                            y2="17"
                        /><line x1="14" y1="11" x2="14" y2="17" /></svg
                    >
                </button>
            {/if}
            <button
                onclick={handleSave}
                disabled={!amount || isNaN(amount) || amount <= 0}
                class="flex-1 bg-neutral-900 text-white font-bold text-lg py-5 rounded-2xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
                Save Transaction
            </button>
        </div>
    </div>
</div>
