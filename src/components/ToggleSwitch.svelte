<script lang="ts">
    export let checked = false;
    export let before = "";
    export let after = "";
</script>

<style lang="scss">
    @use "../styles/styles";

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
        &:before {
            content: "";
            position: absolute;
            width: 3vw;
            height: 3vw;
            border-radius: 1.5vw;
            background: styles.$color;
            left: 0.5vw;
            top: 0.5vw;
            transition: all 0.5s ease;
        }
        &:checked {
            box-shadow: inset 0 0 100px rgba(red(styles.$color), green(styles.$color), blue(styles.$color), 1),
                2px 2px 5px rgba(0, 0, 0, 0.2);
            &::before {
                left: 6.5vw;
                background: white;
            }
        }
    }

    .toggle-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    span {
        text-transform: uppercase;
        font-size: 5vw;
        font-weight: 100;
        color: styles.$color;
        margin: 0 1rem;
    }
</style>

<div class="toggle-container">
    <span>{before}</span>
    <input type="checkbox" bind:checked />
    <span>{after}</span>
</div>
