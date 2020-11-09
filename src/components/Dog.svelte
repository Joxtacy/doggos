<script lang="ts">
    export let primary = "currentColor";
    export let secondary = "currentColor";
</script>

<style lang="scss">
    svg {
        height: 100%;
        width: 100%;
    }
</style>

<svg
    on:click
    aria-hidden="true"
    focusable="false"
    data-icon="dog"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512">
    <g>
        <path fill={secondary} d="M448,278,299,224l21-26,128,46Z" />
        <path
            fill={primary}
            d="M128,224a32,32,0,0,1-32-32,32,32,0,0,0-64,0c0,41.66,26.83,76.85,64,90.1V496a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V384H352V496a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V277.55L298.05,224ZM528,96H464l-7.16-14.31A32,32,0,0,0,428.22,64H374.6L347.32,36.72C337.23,26.64,320,33.78,320,48V197.87l128,45.71V208h32a64,64,0,0,0,64-64V112A16,16,0,0,0,528,96ZM416,128a16,16,0,1,1,16-16A16,16,0,0,1,416,128Z" />
    </g>
</svg>
