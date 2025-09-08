declare module 'iran-cities-json' {
  interface City {
    id: number;
    name: string;
    ostan: number;
  }

  interface Province {
    id: number;
    name: string;
  }

  export const ostan: Province[];
  export const shahr: City[];
}
