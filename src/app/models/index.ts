export interface BudgetEntry {
  id: string;
  amount: number;
  category: string;
  createdAt: string;
  comment?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  groupId: Group['id']
}

export interface Group {
  id: string;
  name: string;
}

export interface BudgetReport {
  entries: BudgetEntry[];
  categoryBudgets: {
    categoryId: Category['id'];
    amount: number;
  }[]
}
