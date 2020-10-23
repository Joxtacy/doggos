<script lang="ts">
    import { animal } from "./stores";
    import DogCard from "./components/DogCard.svelte";
    import CatCard from "./components/CatCard.svelte";
    import BreedPicker from "./components/BreedPicker.svelte";
    import ToggleSwitch from "./components/ToggleSwitch.svelte";
</script>

<style>
    main {
        text-align: center;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        margin: 0;
        text-transform: uppercase;
        font-size: 10vw;
        font-weight: 100;
    }

    .doggo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        max-width: 600px;
    }

    @media screen and (min-width: 768px) {
        h1 {
            padding: 1rem;
        }
    }
</style>

<main>
    {#if $animal === 'dog'}
        <h1>Doggo randomizer</h1>
    {:else if $animal === 'cat'}
        <h1>Kitty randomizer</h1>
    {/if}
    <div class="doggo-container">
        <ToggleSwitch checked />
        <BreedPicker />
        {#if $animal === 'dog'}
            <DogCard />
        {:else if $animal === 'cat'}
            <CatCard />
        {/if}
    </div>
</main>
