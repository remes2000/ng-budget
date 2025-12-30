import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BudgetService } from '../../data-access/budget.service';
import { PrintError } from '../../components/app-print-error/app-print-error';
import { Category } from '@models';
import { disabled, Field, form } from '@angular/forms/signals';

@Component({
  selector: 'app-budget',
  imports: [
    MatButton,
    MatFormField,
    MatInput,
    PrintError,
    Field
  ],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Budget {
  #budgetService = inject(BudgetService);

  #categories = this.#budgetService.categories;
  #groups = this.#budgetService.groups;
  error = this.#budgetService.reportResource.error;

  isSaving = signal(false);

  model = linkedSignal<{ [id: Category['id']]: number }>(() => {
    const budgets = this.#budgetService.budgets();
    const budgetMap = new Map(budgets.map(budget => [budget.category, budget.amount]));

    return this.#categories().reduce((prev, category) => {
      const amount = budgetMap.get(category.id) ?? 0;
      prev[category.id] = amount / 100;
      return prev;
    }, {} as Record<Category['id'], number>);
  });
  form = form(this.model, (m) => {
    disabled(m, () => this.isSaving());
  });

  groupedData = computed(() => {
    const groups = this.#groups();

    return groups.map((group) => {
      const groupCategories = this.#categories()
        .filter(({ groupId }) => group.id === groupId);

      return {
        ...group,
        categories: groupCategories
      }
    });
  });

  fillWithDefaults(): void {
    this.model.update((m) => {
      const updated = { ...m };
      this.#categories().forEach((category) => {
        if (category.id in m) {
          updated[category.id] = category.defaultBudget / 100;
        }
      });
      return updated;
    });
  }

  async submit() {
    this.isSaving.set(true);
    const startTime = Date.now();

    const model = this.model();
    const budgets = Object.keys(model).map((categoryId) => {
      return { categoryId, amount: model[categoryId] };
    });
    await this.#budgetService.batchSaveBudgets(budgets);

    // Fake postpone to remove the flickering
    const elapsed = Date.now() - startTime;
    const minDuration = 700;
    const remainingTime = Math.max(0, minDuration - elapsed);
    setTimeout(() => {
      this.isSaving.set(false);
    }, remainingTime);
  }
}
