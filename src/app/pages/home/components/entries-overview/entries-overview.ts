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
  protected entries = inject(BudgetService).entries;
  protected totalAmount = computed(() =>
    this.entries().reduce((sum, entry) => sum + entry.amount, 0)
  );
}
