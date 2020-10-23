export interface Breed {
    id: string;
    name: string;
}

export interface DogResponse {
    message: string;
    status: string;
}

export interface CatResponse {
    breeds: [];
    id: string;
    url: string;
    width: number;
    height: number;
}