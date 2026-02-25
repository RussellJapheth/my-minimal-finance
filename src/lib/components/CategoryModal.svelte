<script>
    import { fade, fly } from "svelte/transition";
    import { financeStore } from "$lib/stores/finance.svelte";
    import { generateId } from "$lib/utils";
    import { onMount } from "svelte";

    let { onClose, initialCategory = null } = $props();

    function getInit() {
        return initialCategory || {};
    }

    let name = $state(getInit().name || "");
    let type = $state(getInit().type || "expense");
    let isDefault = $derived(
        initialCategory ? initialCategory.isDefault : false,
    );

    let budget = $state(getInit().budget ? String(getInit().budget) : "");

    let displayBudget = $state(
        getInit().budget
            ? Number(getInit().budget).toLocaleString("en-US")
            : "",
    );

    function handleBudgetInput(e) {
        let rawValue = e.target.value.replace(/\D/g, "");
        if (rawValue === "") {
            budget = "";
            displayBudget = "";
            return;
        }
        budget = rawValue;
        displayBudget = Number(rawValue).toLocaleString("en-US");
    }

    let nameInput;

    onMount(() => {
        if (nameInput) nameInput.focus();
    });

    async function handleSave() {
        if (!name.trim()) return;

        const cat = {
            id: initialCategory ? initialCategory.id : "cat-" + generateId(),
            name: name.trim(),
            type,
            isDefault,
            budget:
                (type === "expense" || type === "both") && budget
                    ? Number(budget)
                    : null,
            createdAt: initialCategory
                ? initialCategory.createdAt
                : new Date().toISOString(),
        };

        if (initialCategory) {
            await financeStore.updateCategory(cat);
        } else {
            await financeStore.addCategory(cat);
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
        class="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl h-[70vh] sm:h-auto sm:max-h-[80vh]"
        transition:fly={{ y: 600, duration: 300, opacity: 1 }}
    >
        <!-- Header -->
        <div
            class="flex items-center justify-between p-6 pb-2 border-b border-neutral-100"
        >
            <h2 class="text-xl font-bold text-neutral-900">
                {initialCategory ? "Edit Category" : "New Category"}
            </h2>
            <button
                class="w-8 h-8 flex items-center justify-center text-neutral-400 bg-neutral-100 rounded-full hover:bg-neutral-200"
                onclick={onClose}
                aria-label="Close"
            >
                ✕
            </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
            {#if isDefault}
                <div
                    class="bg-amber-50 text-amber-800 p-4 rounded-2xl text-sm font-medium"
                >
                    This is a default category. You can rename it, but cannot
                    delete it or change its type.
                </div>
            {/if}
            <!-- Type Toggle -->
            <div
                class="flex p-1 bg-neutral-100 rounded-2xl"
                class:opacity-50={initialCategory}
            >
                <button
                    class="flex-1 py-3 text-sm font-semibold rounded-xl transition-colors {type ===
                    'expense'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500'}"
                    onclick={() => !initialCategory && (type = "expense")}
                    disabled={!!initialCategory}
                >
                    Expense
                </button>
                <button
                    class="flex-1 py-3 text-sm font-semibold rounded-xl transition-colors {type ===
                    'income'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500'}"
                    onclick={() => !initialCategory && (type = "income")}
                    disabled={!!initialCategory}
                >
                    Income
                </button>
            </div>

            <!-- Name -->
            <div class="space-y-2">
                <label
                    for="name"
                    class="block text-sm font-medium text-neutral-500"
                    >Category Name</label
                >
                <input
                    bind:this={nameInput}
                    type="text"
                    id="name"
                    bind:value={name}
                    placeholder="e.g. Groceries"
                    class="w-full bg-neutral-50 border-0 rounded-2xl p-4 text-xl font-bold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all outline-none"
                />
            </div>

            <!-- Budget -->
            {#if type === "expense" || type === "both"}
                <div class="space-y-2 transition-all">
                    <label
                        for="budget"
                        class="block text-sm font-medium text-neutral-500"
                        >Monthly Budget (₦) <span
                            class="text-xs text-neutral-400 font-normal"
                            >(Optional)</span
                        ></label
                    >
                    <input
                        type="text"
                        inputmode="numeric"
                        id="budget"
                        value={displayBudget}
                        oninput={handleBudgetInput}
                        placeholder="e.g. 50,000"
                        class="w-full bg-neutral-50 border-0 rounded-2xl p-4 text-xl font-bold text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all outline-none"
                    />
                </div>
            {/if}
        </div>

        <!-- Footer -->
        <div class="p-6 pt-2 pb-8 sm:pb-6 flex gap-3">
            {#if initialCategory && !isDefault}
                <button
                    onclick={async () => {
                        const hasTransactions = financeStore.transactions.some(
                            (t) => t.categoryId === initialCategory.id,
                        );
                        if (hasTransactions) {
                            alert(
                                "Cannot delete category because it has existing transactions.",
                            );
                            return;
                        }
                        if (confirm("Delete this category?")) {
                            await financeStore.removeCategory(
                                initialCategory.id,
                            );
                            onClose();
                        }
                    }}
                    class="w-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 hover:bg-rose-200 transition-colors"
                    aria-label="Delete Category"
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
                disabled={!name.trim()}
                class="flex-1 bg-neutral-900 text-white font-bold text-lg py-5 rounded-2xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
                Save Category
            </button>
        </div>
    </div>
</div>
