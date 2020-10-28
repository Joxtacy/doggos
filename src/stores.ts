import { Writable, writable } from "svelte/store";
import type { Breed } from "./types/types";

export const breeds: Writable<Breed[]> = writable([
    { id: "random", name: "random" },
]);

export const selected: Writable<Breed> = writable({
    id: "random",
    name: "random",
});

export const animal: Writable<string> = writable("dog");

const createDarkMode = (initial: boolean): Writable<boolean> => {
    const DARK = "dark";
    const local = localStorage.getItem(DARK);

    const { subscribe, update, set } = writable(
        local ? local === "true" : initial
    );

    const localSet = (value: boolean) => {
        localStorage.setItem(DARK, value.toString());
        set(value);
    };

    return {
        subscribe,
        update,
        set: localSet,
    };
};

export const darkMode: Writable<boolean> = createDarkMode(false);
