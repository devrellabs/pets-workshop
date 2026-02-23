<script lang="ts">
    import BreedFilter from "./BreedFilter.svelte";
    import DogList from "./DogList.svelte";

    let selectedBreeds: string[] = [];

    function handleBreedSelection(breeds: string[]) {
        selectedBreeds = breeds;
    }
</script>

<BreedFilter {selectedBreeds} onSelectionChange={handleBreedSelection} />
<DogList {selectedBreeds} />
