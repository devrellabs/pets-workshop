<script lang="ts">
    import { onMount } from "svelte";

    interface BreedFilterProps {
        selectedBreeds?: string[];
        onSelectionChange?: (breeds: string[]) => void;
    }

    let { selectedBreeds = $bindable([]), onSelectionChange }: BreedFilterProps = $props();

    let breeds: string[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);
    let isOpen = $state(false);
    let searchQuery = $state("");
    let dropdownRef: HTMLDivElement;

    const fetchBreeds = async () => {
        loading = true;
        error = null;
        try {
            const response = await fetch('/api/breeds');
            if(response.ok) {
                breeds = await response.json();
            } else {
                error = `Failed to fetch breeds: ${response.status} ${response.statusText}`;
            }
        } catch (err) {
            error = `Error: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            loading = false;
        }
    };

    const toggleDropdown = () => {
        isOpen = !isOpen;
        if (isOpen) {
            searchQuery = "";
        }
    };

    const toggleBreed = (breed: string) => {
        if (selectedBreeds.includes(breed)) {
            selectedBreeds = selectedBreeds.filter(b => b !== breed);
        } else {
            selectedBreeds = [...selectedBreeds, breed];
        }
        if (onSelectionChange) {
            onSelectionChange(selectedBreeds);
        }
    };

    const clearAll = () => {
        selectedBreeds = [];
        if (onSelectionChange) {
            onSelectionChange(selectedBreeds);
        }
    };

    const filteredBreeds = $derived(
        breeds.filter(breed => 
            breed.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            isOpen = false;
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            isOpen = false;
        }
    };

    onMount(() => {
        fetchBreeds();
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    });
</script>

<div class="breed-filter" bind:this={dropdownRef}>
    <div class="filter-header">
        <label for="breed-filter-button" class="text-sm font-medium text-slate-300 mb-2 block">
            Filter by Breed
        </label>
        <button
            id="breed-filter-button"
            type="button"
            onclick={toggleDropdown}
            class="filter-button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label="Select dog breeds to filter"
            disabled={loading}
        >
            <span class="filter-button-text">
                {#if loading}
                    Loading breeds...
                {:else if selectedBreeds.length === 0}
                    Select breeds...
                {:else if selectedBreeds.length === 1}
                    {selectedBreeds[0]}
                {:else}
                    {selectedBreeds.length} breeds selected
                {/if}
            </span>
            <svg 
                class="filter-button-icon" 
                class:rotate-180={isOpen}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
            >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>

    {#if isOpen && !loading}
        <div 
            class="dropdown-panel"
            role="listbox"
            aria-label="Breed selection"
        >
            <div class="search-container">
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search breeds..."
                    class="search-input"
                    aria-label="Search for breeds"
                />
            </div>

            {#if selectedBreeds.length > 0}
                <div class="clear-all-container">
                    <button
                        type="button"
                        onclick={clearAll}
                        class="clear-all-button"
                        aria-label="Clear all selected breeds"
                    >
                        Clear all
                    </button>
                </div>
            {/if}

            <div class="breed-list">
                {#if error}
                    <div class="error-message" role="alert">
                        {error}
                    </div>
                {:else if filteredBreeds.length === 0}
                    <div class="empty-message">
                        No breeds found matching "{searchQuery}"
                    </div>
                {:else}
                    {#each filteredBreeds as breed (breed)}
                        <label 
                            class="breed-item"
                            role="option"
                            aria-selected={selectedBreeds.includes(breed)}
                        >
                            <input
                                type="checkbox"
                                checked={selectedBreeds.includes(breed)}
                                onchange={() => toggleBreed(breed)}
                                class="breed-checkbox"
                                aria-label={`Select ${breed}`}
                            />
                            <span class="breed-name">{breed}</span>
                            {#if selectedBreeds.includes(breed)}
                                <svg 
                                    class="check-icon" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            {/if}
                        </label>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .breed-filter {
        position: relative;
        width: 100%;
        max-width: 400px;
        margin-bottom: 1.5rem;
    }

    .filter-header {
        display: flex;
        flex-direction: column;
    }

    .filter-button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: rgb(30 41 59 / 0.6);
        backdrop-filter: blur(8px);
        border: 1px solid rgb(51 65 85 / 0.5);
        border-radius: 0.75rem;
        color: rgb(226 232 240);
        font-size: 0.875rem;
        transition: all 0.2s;
        cursor: pointer;
    }

    .filter-button:hover:not(:disabled) {
        border-color: rgb(59 130 246 / 0.5);
        box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
    }

    .filter-button:focus {
        outline: none;
        border-color: rgb(59 130 246);
        box-shadow: 0 0 0 3px rgb(59 130 246 / 0.2);
    }

    .filter-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .filter-button-text {
        flex: 1;
        text-align: left;
    }

    .filter-button-icon {
        width: 1.25rem;
        height: 1.25rem;
        margin-left: 0.5rem;
        transition: transform 0.2s;
        flex-shrink: 0;
    }

    .filter-button-icon.rotate-180 {
        transform: rotate(180deg);
    }

    .dropdown-panel {
        position: absolute;
        z-index: 50;
        width: 100%;
        margin-top: 0.5rem;
        background-color: rgb(30 41 59 / 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgb(51 65 85 / 0.5);
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgb(0 0 0 / 0.3);
        max-height: 400px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .search-container {
        padding: 0.75rem;
        border-bottom: 1px solid rgb(51 65 85 / 0.3);
    }

    .search-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        background-color: rgb(15 23 42 / 0.5);
        border: 1px solid rgb(51 65 85 / 0.5);
        border-radius: 0.5rem;
        color: rgb(226 232 240);
        font-size: 0.875rem;
        transition: border-color 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: rgb(59 130 246);
    }

    .search-input::placeholder {
        color: rgb(148 163 184);
    }

    .clear-all-container {
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid rgb(51 65 85 / 0.3);
    }

    .clear-all-button {
        width: 100%;
        padding: 0.375rem 0.75rem;
        background-color: rgb(220 38 38 / 0.1);
        border: 1px solid rgb(220 38 38 / 0.3);
        border-radius: 0.5rem;
        color: rgb(248 113 113);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .clear-all-button:hover {
        background-color: rgb(220 38 38 / 0.2);
        border-color: rgb(220 38 38 / 0.5);
    }

    .breed-list {
        overflow-y: auto;
        max-height: 280px;
        padding: 0.25rem;
    }

    .breed-item {
        display: flex;
        align-items: center;
        padding: 0.625rem 0.75rem;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: background-color 0.15s;
        position: relative;
    }

    .breed-item:hover {
        background-color: rgb(51 65 85 / 0.3);
    }

    .breed-item:focus-within {
        background-color: rgb(51 65 85 / 0.4);
        outline: 2px solid rgb(59 130 246 / 0.5);
        outline-offset: -2px;
    }

    .breed-checkbox {
        width: 1rem;
        height: 1rem;
        margin-right: 0.75rem;
        cursor: pointer;
        accent-color: rgb(59 130 246);
        flex-shrink: 0;
    }

    .breed-name {
        flex: 1;
        color: rgb(226 232 240);
        font-size: 0.875rem;
    }

    .check-icon {
        width: 1.25rem;
        height: 1.25rem;
        color: rgb(59 130 246);
        flex-shrink: 0;
        margin-left: 0.5rem;
    }

    .error-message {
        padding: 1rem;
        text-align: center;
        color: rgb(248 113 113);
        font-size: 0.875rem;
    }

    .empty-message {
        padding: 1rem;
        text-align: center;
        color: rgb(148 163 184);
        font-size: 0.875rem;
    }

    /* Custom scrollbar */
    .breed-list::-webkit-scrollbar {
        width: 0.5rem;
    }

    .breed-list::-webkit-scrollbar-track {
        background: rgb(15 23 42 / 0.3);
        border-radius: 0.25rem;
    }

    .breed-list::-webkit-scrollbar-thumb {
        background: rgb(51 65 85);
        border-radius: 0.25rem;
    }

    .breed-list::-webkit-scrollbar-thumb:hover {
        background: rgb(71 85 105);
    }
</style>
