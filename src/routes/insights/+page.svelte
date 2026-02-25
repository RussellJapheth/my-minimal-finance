<script>
    import { financeStore } from "$lib/stores/finance.svelte";
    import { formatCurrency } from "$lib/utils";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import Chart from "chart.js/auto";

    let chartCanvas;
    let chartInstance;
    let currentMonth = $state(new Date().getMonth());
    let currentYear = $state(new Date().getFullYear());

    // Determine initial type from URL parameter or default to expense
    let viewType = $state(
        page.url.searchParams.get("type") === "income" ? "income" : "expense",
    );

    // Derive transactions for the selected month and type
    let monthlyTransactions = $derived(
        financeStore.transactions.filter((t) => {
            const d = new Date(t.date);
            return (
                t.type === viewType &&
                d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear
            );
        }),
    );

    // Group transactions by category
    let transactionsByCategory = $derived.by(() => {
        const groups = {};
        for (const t of monthlyTransactions) {
            if (!groups[t.categoryId]) {
                const cat = financeStore.categories.find(
                    (c) => c.id === t.categoryId,
                );
                groups[t.categoryId] = {
                    name: cat ? cat.name : "Unknown",
                    total: 0,
                };
            }
            groups[t.categoryId].total += t.amount;
        }

        // Convert to array and sort by total descending
        return Object.values(groups).sort((a, b) => b.total - a.total);
    });

    let totalMonthlyAmount = $derived(
        transactionsByCategory.reduce((acc, curr) => acc + curr.total, 0),
    );

    const niceColors = [
        "#f43f5e", // rose-500
        "#8b5cf6", // violet-500
        "#10b981", // emerald-500
        "#f59e0b", // amber-500
        "#3b82f6", // blue-500
        "#ec4899", // pink-500
        "#14b8a6", // teal-500
        "#84cc16", // lime-500
        "#6366f1", // indigo-500
        "#f97316", // orange-500
    ];

    function renderChart() {
        if (!chartCanvas) return;

        if (chartInstance) {
            chartInstance.destroy();
        }

        if (transactionsByCategory.length === 0) return;

        chartInstance = new Chart(chartCanvas, {
            type: "doughnut",
            data: {
                labels: transactionsByCategory.map((c) => c.name),
                datasets: [
                    {
                        data: transactionsByCategory.map((c) => c.total),
                        backgroundColor: niceColors.slice(
                            0,
                            transactionsByCategory.length,
                        ),
                        borderWidth: 0,
                        hoverOffset: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "75%",
                plugins: {
                    legend: {
                        display: false, // We will build a custom legend
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || "";
                                if (label) {
                                    label += ": ";
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                        minimumFractionDigits: 0,
                                    }).format(context.parsed);
                                }
                                return label;
                            },
                        },
                    },
                },
            },
        });
    }

    $effect(() => {
        // Re-render chart when data changes
        if (financeStore.isLoaded && transactionsByCategory) {
            renderChart();
        }
    });

    onMount(() => {
        return () => {
            if (chartInstance) chartInstance.destroy();
        };
    });

    function previousMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    }

    function nextMonth() {
        // Don't go into the future
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
            <h1 class="text-2xl font-bold text-neutral-900">Insights</h1>
        </div>

        <!-- Type Toggle -->
        <div class="flex p-1 bg-neutral-100 rounded-2xl mb-4">
            <button
                class="flex-1 py-2 text-sm font-semibold rounded-xl transition-colors {viewType ===
                'expense'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500'}"
                onclick={() => (viewType = "expense")}
            >
                Expenses
            </button>
            <button
                class="flex-1 py-2 text-sm font-semibold rounded-xl transition-colors {viewType ===
                'income'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500'}"
                onclick={() => (viewType = "income")}
            >
                Income
            </button>
        </div>

        <!-- Month Selector -->
        <div
            class="flex items-center justify-between bg-neutral-900 text-white rounded-2xl p-2"
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
    </header>

    <div class="flex-1 overflow-y-auto p-6 pb-24">
        {#if !financeStore.isLoaded}
            <div class="flex justify-center py-20">
                <div
                    class="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"
                ></div>
            </div>
        {:else if transactionsByCategory.length === 0}
            <div
                class="text-center py-16 text-neutral-500 bg-white rounded-3xl border border-neutral-100 border-dashed"
            >
                <div class="text-4xl mb-3">📊</div>
                <p class="font-medium text-neutral-700">
                    No {viewType} this month
                </p>
                <p class="text-sm mt-1">
                    {viewType === "expense"
                        ? "Great job saving!"
                        : "Time to hustle!"}
                </p>
            </div>
        {:else}
            <!-- Chart Container -->
            <div
                class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-neutral-100 mb-6 flex flex-col items-center justify-center relative"
            >
                <div class="w-48 h-48 relative">
                    <canvas bind:this={chartCanvas}></canvas>
                    <!-- Center Total -->
                    <div
                        class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    >
                        <span
                            class="text-xs font-semibold text-neutral-400 uppercase tracking-widest"
                            >Total</span
                        >
                        <span class="text-lg font-bold text-neutral-900"
                            >{formatCurrency(totalMonthlyAmount)}</span
                        >
                    </div>
                </div>
            </div>

            <!-- Custom Legend / Breakdown -->
            <div class="space-y-3">
                <h2
                    class="text-sm font-bold text-neutral-500 uppercase tracking-wide mb-3 px-2"
                >
                    Where your money went
                </h2>
                {#each transactionsByCategory as item, i}
                    <div
                        class="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between"
                    >
                        <div class="flex items-center gap-4">
                            <div
                                class="w-3 h-3 rounded-full shrink-0"
                                style="background-color: {niceColors[
                                    i % niceColors.length
                                ]}"
                            ></div>
                            <div>
                                <div class="font-semibold text-neutral-900">
                                    {item.name}
                                </div>
                                <div class="text-xs text-neutral-500 mt-0.5">
                                    {(
                                        (item.total / totalMonthlyAmount) *
                                        100
                                    ).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <div class="font-bold text-neutral-900">
                            {formatCurrency(item.total)}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
