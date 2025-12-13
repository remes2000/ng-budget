export interface BudgetEntry {
  id: string;
  amount: number;
  category: string;
  date: Date;
}

export interface Category {
  id: string;
  name: string;
}
