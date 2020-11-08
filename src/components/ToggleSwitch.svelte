<script lang="ts">
    export let checked = false;
    export let before = "";
    export let after = "";
    export let size = 1;
</script>

<style lang="scss">
    @use "../styles/styles";

    input {
        z-index: 3;
        width: calc(var(--m) * 80px);
        height: calc(var(--m) * 40px);
        -webkit-appearance: none;
        position: relative;
        margin: 0;
        outline: none;
        border: none;
        cursor: pointer;
        border-radius: calc(var(--m) * 20px);
        background: white;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        transition: all 0.5s ease;
        &:before {
            content: "";
            position: absolute;
            width: calc(var(--m) * 30px);
            height: calc(var(--m) * 30px);
            border-radius: calc(var(--m) * 15px);
            background: styles.$color;
            left: calc(var(--m) * 5px);
            top: calc(var(--m) * 5px);
            transition: all 0.5s ease;
        }
        &:checked {
            box-shadow: inset 0 0 100px rgba(red(styles.$color), green(styles.$color), blue(styles.$color), 1),
                2px 2px 5px rgba(0, 0, 0, 0.2);
            &::before {
                left: calc(var(--m) * 45px);
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
        font-size: calc(var(--m) * 40px);
        font-weight: 100;
        color: styles.$color;
        margin: 0 calc(var(--m) * 5px);
    }
</style>

<div class="toggle-container" style={`--m: ${size}`}>
    <span>{before}</span>
    <input type="checkbox" bind:checked />
    <span>{after}</span>
</div>
