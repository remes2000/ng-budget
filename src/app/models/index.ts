export interface BudgetEntry {
  id: string;
  amount: number;
  category: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface BudgetReport {
  entries: BudgetEntry[];
  categoryBudgets: Array<{ [categoryId: Category['id']]: number }>;
}
