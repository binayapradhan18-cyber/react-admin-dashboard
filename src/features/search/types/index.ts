export interface UserHit {
  id: string;
  name: string;
  email: string;
}

export interface OrderHit {
  id: string;
  number: string;
  customerName: string;
  total: number;
}

export interface SearchResults {
  users: UserHit[];
  orders: OrderHit[];
}
