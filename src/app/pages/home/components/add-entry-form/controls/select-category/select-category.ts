import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { FormValueControl } from '@angular/forms/signals';
import { Category } from '@models';
import { BudgetService } from '@data-access/budget.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-category',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    FormsModule
  ],
  templateUrl: './select-category.html',
  styleUrl: './select-category.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCategory implements FormValueControl<Category['id']> {
  value = model<Category['id']>('');

  #budgetService = inject(BudgetService);
  categories = this.#budgetService.categories();
  searchPhrase = signal('');
  filteredCategories = computed(() => {
    const phrase = this.searchPhrase().toLowerCase();
    return this.categories.filter(cat =>
      cat.name.toLowerCase().includes(phrase)
    );
  });
}
