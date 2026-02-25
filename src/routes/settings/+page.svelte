<script>
    import { financeStore } from "$lib/stores/finance.svelte";

    let fileInput;

    function exportData() {
        const data = {
            categories: financeStore.categories,
            transactions: financeStore.transactions,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `finance-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.categories || !data.transactions) {
                    alert("Invalid backup file format.");
                    return;
                }
                if (
                    confirm(
                        "This will replace all your current data. Are you sure?",
                    )
                ) {
                    await financeStore.importData(
                        data.categories,
                        data.transactions,
                    );
                    alert("Data imported successfully!");
                    // Reset the file input so the same file could be selected again
                    fileInput.value = "";
                }
            } catch (err) {
                alert("Failed to parse file: " + err.message);
            }
        };
        reader.readAsText(file);
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
            <h1 class="text-2xl font-bold text-neutral-900">Settings</h1>
        </div>
    </header>

    <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div
            class="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
        >
            <a
                href="/categories"
                class="flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors active:bg-neutral-100"
            >
                <div class="flex items-center gap-4">
                    <div
                        class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path d="M4 6h16" /><path d="M4 12h16" /><path
                                d="M4 18h16"
                            /></svg
                        >
                    </div>
                    <div class="font-medium text-neutral-900">
                        Manage Categories
                    </div>
                </div>
                <div class="text-neutral-400">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"><path d="m9 18 6-6-6-6" /></svg
                    >
                </div>
            </a>
        </div>

        <div
            class="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden divide-y divide-neutral-100"
        >
            <button
                class="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors active:bg-neutral-100"
                onclick={exportData}
            >
                <div class="flex items-center gap-4">
                    <div
                        class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                            /><polyline points="7 10 12 15 17 10" /><line
                                x1="12"
                                y1="15"
                                x2="12"
                                y2="3"
                            /></svg
                        >
                    </div>
                    <div class="text-left">
                        <div class="font-medium text-neutral-900">
                            Export Data
                        </div>
                        <div class="text-xs text-neutral-500 mt-0.5">
                            Download JSON backup
                        </div>
                    </div>
                </div>
            </button>

            <button
                class="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors active:bg-neutral-100"
                onclick={() => fileInput.click()}
            >
                <div class="flex items-center gap-4">
                    <div
                        class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                            /><polyline points="17 8 12 3 7 8" /><line
                                x1="12"
                                y1="3"
                                x2="12"
                                y2="15"
                            /></svg
                        >
                    </div>
                    <div class="text-left">
                        <div class="font-medium text-neutral-900">
                            Import Data
                        </div>
                        <div class="text-xs text-neutral-500 mt-0.5">
                            Restore from backup
                        </div>
                    </div>
                </div>
            </button>
            <input
                bind:this={fileInput}
                type="file"
                accept=".json"
                class="hidden"
                onchange={handleFileSelect}
            />
        </div>

        <div class="text-center pt-8">
            <p class="text-xs text-neutral-400">
                All data is stored purely locally on your device.
            </p>
        </div>
    </div>
</div>
