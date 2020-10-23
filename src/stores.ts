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
