import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { BudgetService } from '@data-access/budget.service';
import { Group } from '@models';
import { CategoryComponent } from './components/category/category';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { ComputationService } from '@data-access/computation.service';

@Component({
  selector: 'app-group',
  imports: [ CategoryComponent, InternalCurrencyPipe, MatCard, MatCardHeader, MatCardTitle, MatCardContent ],
  templateUrl: './group.html',
  styleUrl: './group.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent {
  group = input.required<Group>();
  groupId = computed(() => this.group().id);
  #budgetService = inject(BudgetService);
  #computationService = inject(ComputationService);
  categories = computed(() => {
    const allCategories = this.#budgetService.categories();
    return allCategories.filter(category => category.groupId === this.groupId());
  });
  budgetedTotal = computed(() => this.#computationService.groupBudget(this.groupId()));
  actualTotal = computed(() => this.#computationService.groupSpending(this.groupId()));
  difference = computed(() => this.budgetedTotal() - this.actualTotal());
}
