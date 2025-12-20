import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { BudgetService } from '@data-access/budget.service';
import { Group } from '@models';
import { CategoryComponent } from './components/category/category';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';

@Component({
  selector: 'app-group',
  imports: [ CategoryComponent, InternalCurrencyPipe, MatCard, MatCardHeader, MatCardTitle, MatCardContent ],
  templateUrl: './group.html',
  styleUrl: './group.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent {
  group = input.required<Group>();
  #budgetService = inject(BudgetService);
  categories = computed(() => {
    const allCategories = this.#budgetService.categories();
    return allCategories.filter(category => category.groupId === this.group().id);
  });
  budgetedTotal = computed(() => {
    const budgets = this.#budgetService.budgets();
    return this.categories().reduce((sum, category) => {
      const categoryBudget = budgets.find(budget => budget.categoryId === category.id)?.amount ?? 0;
      return sum + categoryBudget;
    }, 0);
  });
  actualTotal = computed(() => {
    const entries = this.#budgetService.entries();
    return this.categories().reduce((sum, category) => {
      const categoryEntries = entries.filter(entry => entry.category === category.id);
      const categoryTotal = categoryEntries.reduce((entrySum, entry) => entrySum + entry.amount, 0);
      return sum + categoryTotal;
    }, 0);
  });
  difference = computed(() => this.budgetedTotal() - this.actualTotal());
}
