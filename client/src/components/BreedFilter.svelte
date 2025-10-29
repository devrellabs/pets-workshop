<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        onFilterChange: (breeds: string[]) => void;
    }

    let { onFilterChange }: Props = $props();
    
    let breeds: string[] = $state([]);
    let selectedBreeds: string[] = $state([]);
    let loading: boolean = $state(true);
    let error: string | null = $state(null);
    let isOpen: boolean = $state(false);

    const fetchBreeds = async () => {
        loading = true;
        error = null;
        try {
            const response = await fetch('/api/breeds');
            if (response.ok) {
                breeds = await response.json();
            } else {
                error = `Failed to fetch breeds: ${response.status}`;
            }
        } catch (err) {
            error = `Error: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    };

    const toggleBreed = (breed: string) => {
        if (selectedBreeds.includes(breed)) {
            selectedBreeds = selectedBreeds.filter(b => b !== breed);
        } else {
            selectedBreeds = [...selectedBreeds, breed];
        }
        onFilterChange(selectedBreeds);
    };

    const clearFilters = () => {
        selectedBreeds = [];
        onFilterChange(selectedBreeds);
    };

    onMount(() => {
        fetchBreeds();
    });
</script>

<div class="breed-filter mb-8">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-slate-100">Filter by Breed</h3>
        {#if selectedBreeds.length > 0}
            <button
                onclick={clearFilters}
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
                Clear filters ({selectedBreeds.length})
            </button>
        {/if}
    </div>

    {#if loading}
        <div class="flex items-center text-slate-400">
            <div class="animate-pulse">Loading breeds...</div>
        </div>
    {:else if error}
        <div class="text-red-400 text-sm">{error}</div>
    {:else}
        <div class="relative">
            <button
                onclick={() => isOpen = !isOpen}
                class="w-full px-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg text-left text-slate-300 hover:border-blue-500/50 transition-colors flex items-center justify-between"
            >
                <span>
                    {#if selectedBreeds.length === 0}
                        Select breeds...
                    {:else if selectedBreeds.length === 1}
                        {selectedBreeds[0]}
                    {:else}
                        {selectedBreeds.length} breeds selected
                    {/if}
                </span>
                <svg
                    class="w-5 h-5 transition-transform {isOpen ? 'rotate-180' : ''}"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {#if isOpen}
                <div class="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                    {#each breeds as breed}
                        <button
                            onclick={() => toggleBreed(breed)}
                            class="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors flex items-center gap-3 border-b border-slate-700/30 last:border-b-0"
                        >
                            <div class="flex items-center justify-center w-5 h-5 border-2 rounded {selectedBreeds.includes(breed) ? 'border-blue-500 bg-blue-500' : 'border-slate-600'}">
                                {#if selectedBreeds.includes(breed)}
                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                {/if}
                            </div>
                            <span class="text-slate-300">{breed}</span>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        {#if selectedBreeds.length > 0}
            <div class="flex flex-wrap gap-2 mt-4">
                {#each selectedBreeds as breed}
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
                        {breed}
                        <button
                            onclick={() => toggleBreed(breed)}
                            class="hover:text-blue-100 transition-colors"
                            aria-label="Remove {breed} filter"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>
    .breed-filter {
        position: relative;
    }
</style>
