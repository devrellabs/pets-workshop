<script lang="ts">
    import { onMount } from "svelte";

    export let selectedBreeds: string[] = [];
    export let onSelectionChange: (breeds: string[]) => void = () => {};

    let breeds: string[] = [];
    let loading = true;
    let error: string | null = null;
    let searchQuery = "";
    let isOpen = false;

    const fetchBreeds = async () => {
        loading = true;
        try {
            const response = await fetch('/api/breeds');
            if (response.ok) {
                const data: string[] = await response.json();
                // Ensure "Mixed Breed" and "Unknown" are present
                const extras = ["Mixed Breed", "Unknown"].filter(
                    (b) => !data.includes(b)
                );
                breeds = [...data, ...extras];
            } else {
                error = `Failed to fetch breeds: ${response.status} ${response.statusText}`;
            }
        } catch (err) {
            error = `Error: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    };

    onMount(() => {
        fetchBreeds();
    });

    $: filteredBreeds = breeds.filter((b) =>
        b.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function toggleBreed(breed: string) {
        if (selectedBreeds.includes(breed)) {
            selectedBreeds = selectedBreeds.filter((b) => b !== breed);
        } else {
            selectedBreeds = [...selectedBreeds, breed];
        }
        onSelectionChange(selectedBreeds);
    }

    function clearAll() {
        selectedBreeds = [];
        onSelectionChange(selectedBreeds);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            isOpen = false;
        }
    }
</script>

<div class="relative mb-6" role="region" aria-label="Breed filter">
    <!-- Toggle button -->
    <button
        type="button"
        class="flex items-center justify-between w-full sm:w-72 px-4 py-2.5 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl text-slate-200 hover:border-blue-500/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Filter by breed"
        on:click={() => (isOpen = !isOpen)}
    >
        <span class="text-sm font-medium">
            {#if selectedBreeds.length === 0}
                Filter by Breed
            {:else}
                {selectedBreeds.length} breed{selectedBreeds.length > 1 ? 's' : ''} selected
            {/if}
        </span>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 ml-2 text-slate-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
        >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
    </button>

    <!-- Selected breed badges -->
    {#if selectedBreeds.length > 0}
        <div class="flex flex-wrap gap-2 mt-2" role="group" aria-label="Selected breeds">
            {#each selectedBreeds as breed (breed)}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs rounded-full">
                    {breed}
                    <button
                        type="button"
                        class="hover:text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-full"
                        aria-label="Remove {breed} filter"
                        on:click={() => toggleBreed(breed)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </span>
            {/each}
            <button
                type="button"
                class="text-xs text-slate-400 hover:text-slate-200 transition-colors underline focus:outline-none focus:ring-1 focus:ring-slate-400 rounded"
                on:click={clearAll}
                aria-label="Clear all breed filters"
            >
                Clear all
            </button>
        </div>
    {/if}

    <!-- Dropdown panel -->
    {#if isOpen}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="absolute z-50 mt-2 w-full sm:w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl"
            on:keydown={handleKeydown}
        >
            <!-- Search input -->
            <div class="p-3 border-b border-slate-700">
                <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                    <input
                        type="search"
                        class="w-full pl-9 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        placeholder="Search breeds..."
                        aria-label="Search breeds"
                        bind:value={searchQuery}
                    />
                </div>
            </div>

            <!-- Breed list -->
            <div
                class="max-h-60 overflow-y-auto py-1"
                role="listbox"
                aria-label="Available breeds"
                aria-multiselectable="true"
            >
                {#if loading}
                    <div class="flex items-center justify-center py-6">
                        <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" role="status" aria-label="Loading breeds"></div>
                        <span class="ml-2 text-sm text-slate-400">Loading breeds...</span>
                    </div>
                {:else if error}
                    <div class="px-4 py-3 text-sm text-red-400" role="alert">
                        {error}
                    </div>
                {:else if filteredBreeds.length === 0}
                    <div class="px-4 py-3 text-sm text-slate-400" role="status">
                        {searchQuery ? 'No breeds match your search.' : 'No breeds available.'}
                    </div>
                {:else}
                    {#each filteredBreeds as breed (breed)}
                        <button
                            type="button"
                            class="flex items-center w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/60 transition-colors focus:outline-none focus:bg-slate-700/60"
                            role="option"
                            aria-selected={selectedBreeds.includes(breed)}
                            on:click={() => toggleBreed(breed)}
                        >
                            <span
                                class="flex-shrink-0 w-4 h-4 mr-3 border rounded flex items-center justify-center transition-colors {selectedBreeds.includes(breed) ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}"
                                aria-hidden="true"
                            >
                                {#if selectedBreeds.includes(breed)}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                {/if}
                            </span>
                            {breed}
                        </button>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>
