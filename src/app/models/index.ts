import type PocketBase from 'pocketbase';
import { type RecordService } from 'pocketbase';

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService // default fallback for any other collection
  collection(idOrName: 'entries'): RecordService<BudgetEntry>
  collection(idOrName: 'category_budgets'): RecordService<CategoryBudget>
  collection(idOrName: 'groups'): RecordService<Group>
  collection(idOrName: 'categories'): RecordService<Category>
  collection(idOrName: 'preferences'): RecordService<Preferences>
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
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  id: string;
  config: PreferencesConfig;
  createdAt: string;
  updatedAt: string;
}

export interface PreferencesConfig {
  reportOrdering?: ReportOrdering;
}

export interface ReportOrdering {
  groupOrder?: string[];
  categoryOrder?: Record<string, string[]>;
}
