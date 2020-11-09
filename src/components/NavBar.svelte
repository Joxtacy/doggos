<script lang="ts">
    import { animal, darkMode } from "../stores";
    import Cat from "./Cat.svelte";
    import Dog from "./Dog.svelte";
    import Sun from "./Sun.svelte";

    export let closedWidth = "80px";

    $: isDog = $animal === "dog";
    function toggleAnimal() {
        $animal = isDog ? "cat" : "dog";
    }

    function toggleDarkMode() {
        $darkMode = !$darkMode;
    }
</script>

<style lang="scss">
    nav {
        z-index: 2;
        position: absolute;
        top: 0;
        left: 0;
        height: 100vh;
        width: var(--closed-width);
        background-color: rebeccapurple;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .svg-container {
        width: 60px;
        height: 60px;
        margin-top: 10px;
    }

    @media screen and (max-width: 768px) {
        nav {
            top: initial;
            bottom: 0;
            height: var(--closed-width);
            width: 100vw;
            flex-direction: row;
        }

        .svg-container {
            margin-top: initial;
            margin-left: 10px;
        }
    }
</style>

<nav style={`--closed-width: ${closedWidth};`}>
    <div class="svg-container dog" on:click={toggleAnimal}>
        {#if $animal === 'dog'}
            <Dog primary={'orange'} />
        {:else}
            <Cat primary={'orange'} />
        {/if}
    </div>
    <div class="svg-container sun" on:click={toggleDarkMode}>
        <Sun strokeColor={$darkMode ? 'grey' : 'yellow'} />
    </div>
</nav>
