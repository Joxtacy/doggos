import { Writable, writable } from "svelte/store";

export const breeds: Writable<string[]> = writable(["random"]);

export const selected: Writable<string> = writable("random");
