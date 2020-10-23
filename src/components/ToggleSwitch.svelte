<script lang="ts">
    import { animal } from "../stores";

    export let checked = false;

    $: {
        checked ? animal.set("dog") : animal.set("cat");
    }
</script>

<style>
    input {
        z-index: 3;
        width: 10vw;
        height: 4vw;
        -webkit-appearance: none;
        position: relative;
        margin: 0;
        outline: none;
        border: none;
        cursor: pointer;
        border-radius: 2.5vw;
        background: white;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        transition: all 0.5s ease;
    }
    input:before {
        content: "";
        position: absolute;
        width: 3vw;
        height: 3vw;
        border-radius: 1.5vw;
        background: #ff3e00;
        left: 0.5vw;
        top: 0.5vw;
        transition: all 0.5s ease;
    }
    input:checked {
        box-shadow: inset 0 0 100px rgba(255, 62, 0, 1),
            2px 2px 5px rgba(0, 0, 0, 0.2);
    }
    input:checked:before {
        left: 6.5vw;
        background: white;
    }
</style>

<input type="checkbox" bind:checked />
