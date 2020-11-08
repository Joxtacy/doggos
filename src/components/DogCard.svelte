<script lang="ts">
    import type { DogResponse, ErrorResponse, RejectFn } from "../types/types";
    import { onDestroy } from "svelte";
    import { darkMode, selected } from "../stores";
    import Spinner from "./Spinner.svelte";

    let data: Promise<string>;

    const getDog = async (): Promise<string> => {
        return new Promise<string>(async (resolve, reject: RejectFn<ErrorResponse>) => {
            const random = $selected.name === "random";
            const url = random
                ? "https://dog.ceo/api/breeds/image/random"
                : `https://dog.ceo/api/breed/${$selected.name}/images/random`;
            return fetch(url)
                .then((res) => res.json())
                .then((json: DogResponse) => fetch(json.message))
                .then((res) => res.blob())
                .then((pic) => resolve(URL.createObjectURL(pic)))
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

    img {
        height: 100%;
        width: 100%;
        object-fit: contain;
        cursor: pointer;
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
            <img src={result} alt="Random Doggo" class:dark={$darkMode} on:click={renewDoggo} />
        {:catch error}
            <div>oh noes {error.message.toLowerCase()}</div>
        {/await}
    </div>
</div>
