<script lang="ts">
    import type { CatResponse } from "../types/types";
    import { onDestroy } from "svelte";
    import { selected } from "../stores";
    import Spinner from "./Spinner.svelte";

    let data: Promise<CatResponse>;

    const getCat = async (): Promise<CatResponse> => {
        return new Promise<CatResponse>(async (resolve, reject) => {
            const random = $selected.name === "random";
            const url = random
                ? "https://api.thecatapi.com/v1/images/search"
                : `https://api.thecatapi.com/v1/images/search?breed_ids=${$selected.id}`;
            const headers = {
                "x-api-key": "199e9233-ea1f-495c-8818-1e680ed0a4f1",
            };
            return fetch(url, { headers })
                .then((res) => res.json())
                .then((json) => resolve(json[0]))
                .catch(() => reject({ message: "Something went wrong" }));
        });
    };

    const renewKitty = () => {
        data = getCat();
    };

    const unsubscribe = selected.subscribe(renewKitty);
    onDestroy(unsubscribe);
</script>

<style lang="scss">
    @use "../styles/styles";

    .cat-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 2px 2px 20px 5px rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        overflow: hidden;
        height: 100%;
        width: 100%;
        max-width: 600px;
    }
    .image-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 400px;
        width: 100%;
    }

    .new-kitty-button {
        border: none;
        background-color: styles.$color;
        color: white;
        border-radius: 1rem;
        padding: 1rem;
        margin: 1rem;
        position: relative;
        box-shadow: 2px 2px 20px 5px rgba(0, 0, 0, 0.3);

        &:active {
            background-color: styles.$color;
            border: none;
            top: 1px;
            left: 1px;
        }

        &:hover {
            opacity: 0.8;
        }
    }

    img {
        height: 100%;
        width: 100%;
        background-color: whitesmoke;
        object-fit: contain;
    }
</style>

<svelte:head>
    <title>Kitties</title>
    <link rel="icon" type="image/png" href="./favicon_kitty.png" />
</svelte:head>

<div class="cat-container">
    <div class="image-container">
        {#await data}
            <Spinner />
        {:then result}
            <img src={result.url} alt="Random Kitty" />
        {:catch error}
            <div>oh noes {error.message.toLowerCase()}</div>
        {/await}
    </div>
    <button on:click|preventDefault={renewKitty} class="new-kitty-button">New
        Kitty</button>
</div>
