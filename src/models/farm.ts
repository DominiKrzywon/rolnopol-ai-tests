export interface Assignment {
  userId: number;
  fieldId: number;
  staffId: number;
  id: number;
  createdAt: string;
}

export interface Field {
  userId: number;
  id: number;
  name: string;
  area: number;
}

export interface Animal {
  id: number;
  type: string;
  amount: number;
}
