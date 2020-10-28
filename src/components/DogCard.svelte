<script lang="ts">
    import type { DogResponse } from "../types/types";
    import { onDestroy } from "svelte";
    import { darkMode, selected } from "../stores";
    import Spinner from "./Spinner.svelte";

    let data: Promise<DogResponse>;

    const getDog = async (): Promise<DogResponse> => {
        return new Promise<DogResponse>(async (resolve, reject) => {
            const random = $selected.name === "random";
            const url = random
                ? "https://dog.ceo/api/breeds/image/random"
                : `https://dog.ceo/api/breed/${$selected.name}/images/random`;
            return fetch(url)
                .then((res) => res.json())
                .then((json) => resolve(json))
                .catch(() => reject({ message: "Something went wrong" }));
        });
    };

    const renewDoggo = () => {
        data = getDog();
    };

    const unsubscribe = selected.subscribe(renewDoggo);
    onDestroy(unsubscribe);
</script>

<style lang="scss">
    @use "../styles/styles";

    .dog-container {
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

    .new-doggo-button {
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
        object-fit: cover;
    }
</style>

<svelte:head>
    <title>Doggos</title>
    <link rel="icon" type="image/png" href="./favicon.png" />
</svelte:head>

<div class="dog-container">
    <div class="image-container">
        {#await data}
            <Spinner />
        {:then result}
            <img src={result.message} alt="Random Doggo" class:dark={$darkMode} />
        {:catch error}
            <div>oh noes {error.message.toLowerCase()}</div>
        {/await}
    </div>
    <button on:click|preventDefault={renewDoggo} class="new-doggo-button">New
        Doggo</button>
</div>
