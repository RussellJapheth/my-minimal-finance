<script>
    import { financeStore } from "$lib/stores/finance.svelte";
    import CategoryModal from "$lib/components/CategoryModal.svelte";

    let showModal = $state(false);
    let selectedCategory = $state(null);

    function openAddModal() {
        selectedCategory = null;
        showModal = true;
    }

    function openEditModal(c) {
        selectedCategory = c;
        showModal = true;
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
            <h1 class="text-2xl font-bold text-neutral-900">Categories</h1>
        </div>
    </header>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-6 pb-24">
        {#if !financeStore.isLoaded}
            <div class="animate-pulse space-y-3">
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
                <div class="h-16 bg-neutral-200 rounded-2xl"></div>
            </div>
        {:else}
            <div class="space-y-6">
                <div>
                    <h2
                        class="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-3 px-2"
                    >
                        Income Categories
                    </h2>
                    <div class="space-y-2">
                        {#each financeStore.categories.filter((c) => c.type === "income" || c.type === "both") as c (c.id)}
                            <button
                                class="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between active:scale-[0.98] transition-transform"
                                onclick={() => openEditModal(c)}
                            >
                                <div class="font-semibold text-neutral-900">
                                    {c.name}
                                </div>
                                <div
                                    class="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        ><path d="m9 18 6-6-6-6" /></svg
                                    >
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>

                <div>
                    <h2
                        class="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-3 px-2"
                    >
                        Expense Categories
                    </h2>
                    <div class="space-y-2">
                        {#each financeStore.categories.filter((c) => c.type === "expense" || c.type === "both") as c (c.id)}
                            <button
                                class="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between active:scale-[0.98] transition-transform"
                                onclick={() => openEditModal(c)}
                            >
                                <div class="font-semibold text-neutral-900">
                                    {c.name}
                                </div>
                                <div
                                    class="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        ><path d="m9 18 6-6-6-6" /></svg
                                    >
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- FAB -->
    <button
        class="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-neutral-900 text-white rounded-full shadow-xl flex justify-center items-center text-4xl font-light hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all z-20"
        onclick={openAddModal}
        aria-label="Add Category"
    >
        +
    </button>
</div>

{#if showModal}
    <CategoryModal
        initialCategory={selectedCategory}
        onClose={() => (showModal = false)}
    />
{/if}
