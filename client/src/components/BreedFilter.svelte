<script lang="ts">
    import { onMount } from "svelte";

    interface Breed {
        id: number;
        name: string;
    }

    export let selectedBreeds: string[] = [];

    let breeds: Breed[] = [];
    let loading = true;
    let error: string | null = null;
    let searchQuery = "";
    let dropdownOpen = false;

    const EXTRA_OPTIONS: Breed[] = [
        { id: -1, name: "Mixed Breed" },
        { id: -2, name: "Unknown" },
    ];

    $: allBreeds = [...EXTRA_OPTIONS, ...breeds];

    $: filteredBreeds = allBreeds.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchBreeds = async () => {
        loading = true;
        try {
            const response = await fetch('/api/breeds');
            if (response.ok) {
                const data: Breed[] = await response.json();
                breeds = data;
            } else {
                error = `Failed to load breeds: ${response.status} ${response.statusText}`;
            }
        } catch (err) {
            error = `Error: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    };

    function toggleBreed(name: string) {
        if (selectedBreeds.includes(name)) {
            selectedBreeds = selectedBreeds.filter(b => b !== name);
        } else {
            selectedBreeds = [...selectedBreeds, name];
        }
    }

    function clearAll() {
        selectedBreeds = [];
    }

    function closeDropdown(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-breed-filter]')) {
            dropdownOpen = false;
        }
    }

    onMount(() => {
        fetchBreeds();
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    });
</script>

<div class="relative mb-6" data-breed-filter data-testid="breed-filter">
    <!-- Trigger button -->
    <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label="Filter by breed"
        class="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 hover:border-blue-500/50 rounded-xl px-4 py-2.5 text-slate-300 transition-colors w-full sm:w-auto min-w-[220px]"
        on:click={() => (dropdownOpen = !dropdownOpen)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V17a1 1 0 01-.553.894l-4 2A1 1 0 017 19v-8.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
        </svg>
        <span class="flex-1 text-left text-sm">
            {#if selectedBreeds.length === 0}
                Filter by Breed
            {:else if selectedBreeds.length === 1}
                {selectedBreeds[0]}
            {:else}
                {selectedBreeds.length} breeds selected
            {/if}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 shrink-0 transition-transform {dropdownOpen ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
    </button>

    <!-- Selected breed badges -->
    {#if selectedBreeds.length > 0}
        <div class="flex flex-wrap gap-2 mt-2" data-testid="selected-breed-badges">
            {#each selectedBreeds as breed}
                <span class="inline-flex items-center gap-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs rounded-full px-3 py-1">
                    {breed}
                    <button
                        type="button"
                        aria-label="Remove {breed} filter"
                        class="hover:text-blue-100"
                        on:click={() => toggleBreed(breed)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </span>
            {/each}
            <button
                type="button"
                class="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                on:click={clearAll}
            >
                Clear all
            </button>
        </div>
    {/if}

    <!-- Dropdown panel -->
    {#if dropdownOpen}
        <div
            role="listbox"
            aria-multiselectable="true"
            aria-label="Breed options"
            class="absolute z-50 mt-1 w-full sm:w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
            data-testid="breed-dropdown"
        >
            <!-- Search input -->
            <div class="p-2 border-b border-slate-700">
                <input
                    type="search"
                    placeholder="Search breeds..."
                    bind:value={searchQuery}
                    aria-label="Search breeds"
                    class="w-full bg-slate-700/50 text-slate-200 placeholder-slate-400 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500/50"
                />
            </div>

            <!-- Options list -->
            <ul class="max-h-60 overflow-y-auto py-1" role="group">
                {#if loading}
                    <li class="px-3 py-4 text-center text-slate-400 text-sm" role="option" aria-selected="false">
                        <span class="inline-block animate-pulse">Loading breeds...</span>
                    </li>
                {:else if error}
                    <li class="px-3 py-4 text-center text-red-400 text-sm" role="option" aria-selected="false">{error}</li>
                {:else if filteredBreeds.length === 0}
                    <li class="px-3 py-4 text-center text-slate-400 text-sm" role="option" aria-selected="false">No breeds found</li>
                {:else}
                    {#each filteredBreeds as breed (breed.id)}
                        <li role="option" aria-selected={selectedBreeds.includes(breed.name)}>
                            <button
                                type="button"
                                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/60 transition-colors text-left"
                                on:click={() => toggleBreed(breed.name)}
                            >
                                <span
                                    class="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors
                                        {selectedBreeds.includes(breed.name)
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-slate-500'}"
                                    aria-hidden="true"
                                >
                                    {#if selectedBreeds.includes(breed.name)}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                </span>
                                {breed.name}
                            </button>
                        </li>
                    {/each}
                {/if}
            </ul>
        </div>
    {/if}
</div>
