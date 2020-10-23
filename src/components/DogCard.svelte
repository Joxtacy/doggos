<script lang="ts">
    import type { DogResponse } from "../types/types";
    import Spinner from "./Spinner.svelte";
    import { selected } from "../stores";

    let data: Promise<DogResponse>;

    const getDog = async (): Promise<DogResponse> => {
        return new Promise<DogResponse>(async (resolve, reject) => {
            const random = $selected === "random";
            let url = random
                ? "https://dog.ceo/api/breeds/image/random"
                : `https://dog.ceo/api/breed/${$selected}/images/random`;
            return fetch(url)
                .then((res) => res.json())
                .then((json) => resolve(json))
                .catch(() => reject({ message: "Something went wrong" }));
        });
    };

    const renewDoggo = () => (data = getDog());

    selected.subscribe(renewDoggo);
</script>

<style>
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
        background-color: #ff3e00;
        color: white;
        border-radius: 1rem;
        padding: 1rem;
        margin: 1rem;
        position: relative;
        box-shadow: 2px 2px 20px 5px rgba(0, 0, 0, 0.3);
    }

    .new-doggo-button:hover {
        opacity: 0.8;
    }

    .new-doggo-button:active {
        background-color: #ff3e00;
        border: none;
        top: 1px;
        left: 1px;
    }

    img {
        height: 100%;
        width: 100%;
        background-color: whitesmoke;
        object-fit: contain;
    }
</style>

<div class="dog-container">
    <div class="image-container">
        {#await data}
            <Spinner />
        {:then result}
            <img src={result.message} alt="Random Doggo" />
        {:catch error}
            <div>oh noes {error.message.toLowerCase()}</div>
        {/await}
    </div>
    <button on:click|preventDefault={renewDoggo} class="new-doggo-button">New
        Doggo</button>
</div>
