import type PocketBase from 'pocketbase';
import { type RecordService } from 'pocketbase';

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService // default fallback for any other collection
  collection(idOrName: 'entries'): RecordService<BudgetEntry>
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

export interface BudgetReport {
  entries: BudgetEntry[];
  categoryBudgets: {
    categoryId: Category['id'];
    amount: number;
  }[]
}
