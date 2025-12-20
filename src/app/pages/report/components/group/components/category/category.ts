import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';
import { Category } from '@models';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { ColorAmount } from 'src/app/directives/color-amount';
import { BudgetValue } from './budget-value/budget-value';
import { ComputationService } from '@data-access/computation.service';

@Component({
  selector: 'app-category',
  imports: [ BudgetValue, InternalCurrencyPipe, ColorAmount ],
  templateUrl: './category.html',
  styleUrl: './category.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryComponent {
  category = input.required<Category>();
  categoryId = computed(() => this.category().id);
  #budgetService = inject(BudgetService);
  #computationService = inject(ComputationService);
  budgetedAmount = computed(() => this.#computationService.categoryBudget(this.categoryId()));
  actualAmount = computed(() => this.#computationService.categorySpending(this.categoryId()));
  difference = computed(() => this.budgetedAmount() - this.actualAmount());

  updateBudget(newAmount: number): void {
    this.#budgetService.updateBudgetForCategory(this.category().id, newAmount);
  }
}
