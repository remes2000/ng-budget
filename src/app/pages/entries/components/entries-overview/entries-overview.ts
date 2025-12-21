import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';
import { SingleEntry } from './components/single-entry/single-entry';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entries-overview',
  imports: [SingleEntry, InternalCurrencyPipe, MatInput, MatFormField, MatLabel, FormsModule],
  templateUrl: './entries-overview.html',
  styleUrl: './entries-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntriesOverview {
  #budgetService = inject(BudgetService);
  protected searchTerm = signal('');

  protected entries = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const categories = this.#budgetService.categories();

    return this.#budgetService.entries()
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
