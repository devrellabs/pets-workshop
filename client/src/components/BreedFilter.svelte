<script lang="ts">
    import { onMount } from "svelte";

    interface Breed {
        id: number;
        name: string;
    }

    export let selectedBreeds: string[] = [];
    export let onFilterChange: (breeds: string[]) => void = () => {};

    let breeds: Breed[] = [];
    let loading = true;
    let error: string | null = null;
    let isDropdownOpen = false;
    let searchQuery = "";
    let dropdownRef: HTMLDivElement;

    // Fetch breeds from API
    const fetchBreeds = async () => {
        loading = true;
        try {
            const response = await fetch('/api/breeds');
            if (response.ok) {
                breeds = await response.json();
                // Add special options for edge cases
                breeds.push(
                    { id: -1, name: "Mixed Breed" },
                    { id: -2, name: "Unknown" }
                );
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

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
                isDropdownOpen = false;
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });

    // Filter breeds based on search query
    $: filteredBreeds = breeds.filter(breed =>
        breed.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Toggle breed selection
    const toggleBreed = (breedName: string) => {
        if (selectedBreeds.includes(breedName)) {
            selectedBreeds = selectedBreeds.filter(b => b !== breedName);
        } else {
            selectedBreeds = [...selectedBreeds, breedName];
        }
        onFilterChange(selectedBreeds);
    };

    // Clear all selections
    const clearAll = () => {
        selectedBreeds = [];
        onFilterChange(selectedBreeds);
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        isDropdownOpen = !isDropdownOpen;
        if (isDropdownOpen) {
            searchQuery = "";
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            isDropdownOpen = false;
        }
    };

    // Get display text for selected breeds
    $: displayText = selectedBreeds.length === 0 
        ? 'Select breeds...' 
        : `${selectedBreeds.length} breed${selectedBreeds.length > 1 ? 's' : ''} selected`;
</script>

<div class="relative" bind:this={dropdownRef} role="combobox" aria-expanded={isDropdownOpen} aria-haspopup="listbox" aria-label="Breed filter">
    <!-- Dropdown Button -->
    <button
        type="button"
        onclick={toggleDropdown}
        onkeydown={handleKeyDown}
        class="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-lg text-slate-100 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        aria-label="Toggle breed filter dropdown"
    >
        <div class="flex items-center gap-2 flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
            </svg>
            <span class={selectedBreeds.length === 0 ? 'text-slate-400' : 'text-slate-100'}>
                {displayText}
            </span>
        </div>
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 text-slate-400 transition-transform {isDropdownOpen ? 'rotate-180' : ''}" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
        >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
    </button>

    <!-- Selected Breeds Badges -->
    {#if selectedBreeds.length > 0}
        <div class="flex flex-wrap gap-2 mt-2" role="list" aria-label="Selected breeds">
            {#each selectedBreeds as breed (breed)}
                <span 
                    class="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                    role="listitem"
                >
                    {breed}
                    <button
                        type="button"
                        onclick={() => toggleBreed(breed)}
                        class="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        aria-label={`Remove ${breed} filter`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </span>
            {/each}
            <button
                type="button"
                onclick={clearAll}
                class="inline-flex items-center px-3 py-1 text-sm text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded"
                aria-label="Clear all breed filters"
            >
                Clear all
            </button>
        </div>
    {/if}

    <!-- Dropdown Menu -->
    {#if isDropdownOpen}
        <div 
            class="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-hidden"
            role="listbox"
            aria-label="Breed options"
        >
            <!-- Search Input -->
            <div class="p-3 border-b border-slate-700">
                <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search breeds..."
                        class="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        aria-label="Search breeds"
                    />
                </div>
            </div>

            <!-- Breed List -->
            <div class="overflow-y-auto max-h-80">
                {#if loading}
                    <div class="p-4 text-center text-slate-400">
                        <div class="animate-pulse">Loading breeds...</div>
                    </div>
                {:else if error}
                    <div class="p-4 text-center text-red-400">
                        {error}
                    </div>
                {:else if filteredBreeds.length === 0}
                    <div class="p-4 text-center text-slate-400">
                        No breeds found matching "{searchQuery}"
                    </div>
                {:else}
                    {#each filteredBreeds as breed (breed.id)}
                        <button
                            type="button"
                            onclick={() => toggleBreed(breed.name)}
                            class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors focus:outline-none focus:bg-slate-700/50 text-left"
                            role="option"
                            aria-selected={selectedBreeds.includes(breed.name)}
                        >
                            <div class="flex items-center justify-center w-5 h-5 border-2 rounded {selectedBreeds.includes(breed.name) ? 'border-blue-500 bg-blue-500' : 'border-slate-600'}">
                                {#if selectedBreeds.includes(breed.name)}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                {/if}
                            </div>
                            <span class="text-slate-200">{breed.name}</span>
                        </button>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>
