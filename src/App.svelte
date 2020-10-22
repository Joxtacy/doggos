<script lang="ts">
    import DogCard from "./components/DogCard.svelte";
    import BreedPicker from "./components/BreedPicker.svelte";
</script>

<style>
    main {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    .doggo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }

</style>

<main>
    <h1>Doggo randomizer</h1>
    <div class="doggo-container">
        <BreedPicker />
        <DogCard />
    </div>
</main>
