<script lang="ts">
    import BreedFilter from './BreedFilter.svelte';
    import DogList from './DogList.svelte';
    import type { ComponentType } from 'svelte';

    let dogListRef: ComponentType<typeof DogList> | undefined;
    
    const handleFilterChange = (breeds: string[]) => {
        if (dogListRef && 'handleBreedFilterChange' in dogListRef) {
            dogListRef.handleBreedFilterChange(breeds);
        }
    };
</script>

<div>
    <BreedFilter onFilterChange={handleFilterChange} />
    <DogList bind:this={dogListRef} />
</div>
