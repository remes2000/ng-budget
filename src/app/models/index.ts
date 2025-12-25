import type PocketBase from 'pocketbase';
import { type RecordService } from 'pocketbase';

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService // default fallback for any other collection
  collection(idOrName: 'entries'): RecordService<BudgetEntry>
  collection(idOrName: 'category_budgets'): RecordService<CategoryBudget>
}

export interface BudgetEntry {
  id: string;
  year: number;
  month: number;
  amount: number;
  category: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudget {
  id: string;
  year: number;
  month: number;
  amount: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetReport {
  entries: BudgetEntry[];
  categoryBudgets: Array<CategoryBudget>;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  groupId: Group['id'];
  defaultBudget: number;
}

export interface Group {
  id: string;
  name: string;
}
