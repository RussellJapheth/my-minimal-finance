<script>
    import "./layout.css";
    import { financeStore } from "$lib/stores/finance.svelte";
    import { onMount } from "svelte";

    let { children } = $props();

    onMount(() => {
        financeStore.loadData();
    });
</script>

<svelte:head>
    <title>Finance Tracker</title>
    <meta name="theme-color" content="#ffffff" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
</svelte:head>

<div
    class="min-h-[100dvh] bg-neutral-100 sm:py-8 flex justify-center text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white"
>
    <main
        class="w-full max-w-md bg-white sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-neutral-200 overflow-hidden relative flex flex-col min-h-[100dvh] sm:min-h-0 sm:h-[844px]"
    >
        {@render children()}
    </main>
</div>
