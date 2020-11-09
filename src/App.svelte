<script lang="ts">
    import { animal, darkMode } from "./stores";
    import DogCard from "./components/DogCard.svelte";
    import CatCard from "./components/CatCard.svelte";
    import BreedPicker from "./components/BreedPicker.svelte";
    import NavBar from "./components/NavBar.svelte";

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
        padding-left: 80px;
    }

    h1 {
        color: styles.$color;
        margin: 0;
        text-transform: uppercase;
        font-size: 5vw;
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
            display: initial;
            padding: 1rem;
        }
    }

    @media screen and (max-width: 768px) {
        main {
            padding-left: initial;
            padding-bottom: 80px;
            height: calc(100% - 80px);
        }
    }

    .container {
        height: 100%;
        position: relative;
    }
</style>

<div class="container">
    <NavBar />
    <main class:dark={$darkMode}>
        {#if $animal === 'dog'}
            <h1>Doggo randomizer</h1>
        {:else if $animal === 'cat'}
            <h1>Kitty randomizer</h1>
        {/if}
        <div class="doggo-container">
            <BreedPicker />
            {#if $animal === 'dog'}
                <DogCard />
            {:else if $animal === 'cat'}
                <CatCard />
            {/if}
        </div>
    </main>
</div>
