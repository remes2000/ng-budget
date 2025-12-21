import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';
import { SingleEntry } from './components/single-entry/single-entry';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';

@Component({
  selector: 'app-entries-overview',
  imports: [SingleEntry, InternalCurrencyPipe],
  templateUrl: './entries-overview.html',
  styleUrl: './entries-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntriesOverview {
  #budgetService = inject(BudgetService);
  protected entries = computed(() => {
    return this.#budgetService.entries().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }) 

  protected totalAmount = computed(() =>
    this.entries().reduce((sum, entry) => sum + entry.amount, 0)
  );
}
