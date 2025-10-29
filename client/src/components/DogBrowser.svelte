<script lang="ts">
    import BreedFilter from './BreedFilter.svelte';
    import DogList from './DogList.svelte';

    let dogListRef: any;
    
    const handleFilterChange = (breeds: string[]) => {
        if (dogListRef?.handleBreedFilterChange) {
            dogListRef.handleBreedFilterChange(breeds);
        }
    };
</script>

<div>
    <BreedFilter onFilterChange={handleFilterChange} />
    <DogList bind:this={dogListRef} />
</div>
