import { inject, Injectable } from '@angular/core';
import { BudgetService } from './budget.service';
import { Category, Group } from '@models';

@Injectable({
  providedIn: 'root'
})
export class ComputationService {
  #budgetService = inject(BudgetService);

  categorySpending(categoryId: Category['id']): number {
    const entries = this.#budgetService.entries();
    return entries
      .filter(entry => entry.category === categoryId)
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  categoryBudget(categoryId: Category['id']): number {
    const budgets = this.#budgetService.budgets();
    return budgets.find((budget) => budget.categoryId === categoryId)?.amount ?? 0;
  }

  groupSpending(groupId: Group['id']): number {
    const categories = this.#budgetService.categories().filter(cat => cat.groupId === groupId);
    return categories
      .map(cat => this.categorySpending(cat.id))
      .reduce((sum, amount) => sum + amount, 0);
  }

  groupBudget(groupId: Group['id']): number {
    const categories = this.#budgetService.categories().filter(cat => cat.groupId === groupId);
    return categories
      .map(cat => this.categoryBudget(cat.id))
      .reduce((sum, amount) => sum + amount, 0);
  }
}
