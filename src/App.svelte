<script lang="ts">
    import { animal, darkMode } from "./stores";
    import DogCard from "./components/DogCard.svelte";
    import CatCard from "./components/CatCard.svelte";
    import BreedPicker from "./components/BreedPicker.svelte";
    import ToggleSwitch from "./components/ToggleSwitch.svelte";

    let isDog = $animal === "dog";
    $: $animal = isDog ? "dog" : "cat";
</script>

<style lang="scss">
    @use "./styles/styles";

    main {
        text-align: center;
        margin: 0 auto;
        height: 100%;
        background-color: white;
        overflow-y: auto;
    }

    h1 {
        color: styles.$color;
        margin: 0;
        text-transform: uppercase;
        font-size: 5vw;
        font-weight: 100;
        display: none;
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
            display: initial;
            padding: 1rem;
        }
    }
</style>

<main class:dark={$darkMode}>
    {#if $animal === 'dog'}
        <h1>Doggo randomizer</h1>
    {:else if $animal === 'cat'}
        <h1>Kitty randomizer</h1>
    {/if}
    <div class="doggo-container">
        <ToggleSwitch
            bind:checked={isDog}
            before="Cats"
            after="Dogs"
            size={0.75} />
        <BreedPicker />
        {#if $animal === 'dog'}
            <DogCard />
        {:else if $animal === 'cat'}
            <CatCard />
        {/if}
    </div>
    <div class="darkmode-toggle">
        <ToggleSwitch
            bind:checked={$darkMode}
            before="☀️"
            after="🌙"
            size={0.5} />
    </div>
</main>
