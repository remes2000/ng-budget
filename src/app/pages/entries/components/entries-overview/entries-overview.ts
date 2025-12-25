import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';
import { SingleEntry } from './components/single-entry/single-entry';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { PrintError } from 'src/app/components/app-print-error/app-print-error';

@Component({
  selector: 'app-entries-overview',
  imports: [SingleEntry, InternalCurrencyPipe, MatInput, MatFormField, MatLabel, FormsModule, PrintError],
  templateUrl: './entries-overview.html',
  styleUrl: './entries-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntriesOverview {
  #budgetService = inject(BudgetService);
  reportResource = this.#budgetService.reportResource;
  error = this.reportResource.error;

  protected searchTerm = signal('');

  protected entries = computed(() => {
    if (!this.reportResource.hasValue()) {
      return [];
    }

    const term = this.searchTerm().toLowerCase().trim();
    const categories = this.#budgetService.categories();

    return this.reportResource.value().entries
      .filter(entry => {
        if (!term) return true;

        const category = categories.find(c => c.id === entry.category);
        const categoryName = category?.name.toLowerCase() ?? '';
        const comment = (entry.comment ?? '').toLowerCase();

        return categoryName.includes(term) || comment.includes(term);
      })
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  });

  protected totalAmount = computed(() =>
    this.entries().reduce((sum, entry) => sum + entry.amount, 0)
  );
}
