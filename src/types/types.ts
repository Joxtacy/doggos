export interface Breed {
    id: string;
    name: string;
}

export interface APIResponse {
    message: string;
}

export interface ErrorResponse extends APIResponse {}

export interface DogResponse extends APIResponse {
    status: string;
}

export interface CatResponse {
    breeds: [];
    id: string;
    url: string;
    width: number;
    height: number;
}

export type Animals = "dog" | "cat";

export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type UnaryOperator<T> = (value: T) => T;

export type RejectFn<T> = (reason: T) => void;
