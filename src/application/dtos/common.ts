export type ISODateString = string;

export interface MoneyDTO {
  amount: number;
  currency: string;
}

export interface PageRequestDTO {
  page?: number;
  pageSize?: number;
}

export interface PageResultDTO<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}
