<script lang="ts">
    import { onDestroy } from "svelte";
    import { breeds, selected, animal } from "../stores";

    const getBreedList = (animal: string) => {
        const defaultBreed = {
            id: "random",
            name: "random",
        };
        switch (animal) {
            case "dog": {
                fetch("https://dog.ceo/api/breeds/list/all")
                    .then((res) => res.json())
                    .then((json) => {
                        const keys = Object.keys(json.message);
                        const keysAndObjs = keys.map((key) => ({
                            id: key,
                            name: key,
                        }));
                        const dogBreeds = [defaultBreed, ...keysAndObjs];
                        breeds.set(dogBreeds);
                        selected.set(defaultBreed);
                    });
                break;
            }
            case "cat": {
                fetch("https://api.thecatapi.com/v1/breeds")
                    .then((res) => res.json())
                    .then((json) => {
                        const catBreeds = [
                            defaultBreed,
                            ...json.map((breed) => ({
                                id: breed.id,
                                name: breed.name,
                            })),
                        ];
                        breeds.set(catBreeds);
                        selected.set(defaultBreed);
                    });
                break;
            }
            default: {
            }
        }
    };

    const unsubscribe = animal.subscribe((value) => {
        getBreedList(value);
    });
    onDestroy(unsubscribe);
</script>

<style lang="scss">
    @use "../styles/styles";

    select {
        min-width: 20ch;
        text-transform: capitalize;
        margin: 1vw;
        width: 100%;
        background-color: white;
        color: styles.$color;
    }
</style>

<select bind:value={$selected}>
    {#each $breeds as breed}
        <option value={breed}>{breed.name}</option>
    {/each}
</select>
