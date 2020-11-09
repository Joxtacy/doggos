<script lang="ts">
    import { animal, darkMode } from "../stores";
    import type { Animals } from "../types/types";
    import Cat from "./Cat.svelte";
    import Dog from "./Dog.svelte";
    import Sun from "./Sun.svelte";

    export let closedWidth = "80px";

    function toggleAnimal(a: Animals): void {
        $animal = a;
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
        display: grid;
        grid-template-rows: var(--closed-width) var(--closed-width) auto var(--closed-width);
        justify-items: center;
        align-items: center;
    }

    .svg-container {
        width: 60px;
        height: 60px;
    }

    .sun {
        grid-row-start: 4;
    }

    @media screen and (max-width: 768px) {
        nav {
            top: initial;
            bottom: 0;
            height: var(--closed-width);
            width: 100vw;
            grid-template-rows: initial;
            grid-template-columns: var(--closed-width) var(--closed-width) auto var(--closed-width);
        }

        .svg-container {
            margin-top: initial;
            margin-left: 10px;
        }
        .sun {
            grid-row-start: initial;
            grid-column-start: 4;
        }
    }
</style>

<nav style={`--closed-width: ${closedWidth};`}>
    <div class="svg-container dog" on:click={() => toggleAnimal('dog')}>
        <Dog primary={$animal === 'dog' ? 'orange' : 'grey'} />
    </div>
    <div class="svg-container cat" on:click={() => toggleAnimal('cat')}>
        <Cat primary={$animal === 'cat' ? 'orange' : 'grey'} />
    </div>
    <div class="svg-container sun" on:click={toggleDarkMode}>
        <Sun strokeColor={$darkMode ? 'grey' : 'yellow'} />
    </div>
</nav>
