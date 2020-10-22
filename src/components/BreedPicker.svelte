<script lang="ts">
    import { breeds, selected } from "../stores";

    const getBreedList = () => {
        if ($breeds.length === 1) {
            fetch("https://dog.ceo/api/breeds/list/all")
                .then((res) => res.json())
                .then((json) => {
                    breeds.update((n) => {
                        return n.concat(Object.keys(json.message));
                    });
                    selected.set($breeds[0]);
                });
        }
    };

    getBreedList();
</script>

<style>
    select {
        min-width: 20ch;
        text-transform: capitalize;
        margin: 1rem;
    }
</style>

<select bind:value={$selected}>
    {#each $breeds as breed}
        <option value={breed}>{breed}</option>
    {/each}
</select>
