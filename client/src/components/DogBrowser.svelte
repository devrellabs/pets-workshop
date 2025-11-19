<script lang="ts">
    import BreedFilter from './BreedFilter.svelte';
    import DogList from './DogList.svelte';
    
    let selectedBreeds: string[] = [];
    
    const handleFilterChange = (breeds: string[]) => {
        selectedBreeds = breeds;
    };
</script>

<div>
    <div class="mb-6 max-w-md">
        <BreedFilter bind:selectedBreeds onFilterChange={handleFilterChange} />
    </div>
    
    <DogList selectedBreeds={selectedBreeds} />
</div>
