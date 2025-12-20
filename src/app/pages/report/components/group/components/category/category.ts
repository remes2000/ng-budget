import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';
import { Category } from '@models';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { ColorAmount } from 'src/app/directives/color-amount';
import { BudgetValue } from './budget-value/budget-value';

@Component({
  selector: 'app-category',
  imports: [ BudgetValue, InternalCurrencyPipe, ColorAmount ],
  templateUrl: './category.html',
  styleUrl: './category.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryComponent {
  category = input.required<Category>();
  #budgetService = inject(BudgetService);
  // I don't like I have these calculations in components
  // I would rather keep all the formulas in one place
  budgetedAmount = computed(() => {
    const budgets = this.#budgetService.budgets();
    return budgets.find((budget) => budget.categoryId === this.category().id)?.amount ?? 0;
  });
  actualAmount = computed(() => {
    const entries = this.#budgetService.entries();
    return entries
      .filter(entry => entry.category === this.category().id)
      .reduce((sum, entry) => sum + entry.amount, 0);
  });
  difference = computed(() => this.budgetedAmount() - this.actualAmount());

  updateBudget(newAmount: number): void {
    this.#budgetService.updateBudgetForCategory(this.category().id, newAmount);
  }
}
