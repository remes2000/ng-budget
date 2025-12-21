import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, model, output, signal, viewChild } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { FormValueControl } from '@angular/forms/signals';
import { Category } from '@models';
import { BudgetService } from '@data-access/budget.service';
import { FormsModule } from '@angular/forms';

// TODO: this control is half baked, it does not support all features like disabled state, errors etc.
// To be honest I don't know how to do it and I have to learn it later. 
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
  disabled = model(false);

  private inputElement = viewChild<ElementRef<HTMLInputElement>>('categoryInput');

  #budgetService = inject(BudgetService);
  categories = this.#budgetService.categories();
  searchPhrase = signal('');
  filteredCategories = computed(() => {
    const phrase = this.searchPhrase().toLowerCase();
    return this.categories.filter(cat =>
      cat.name.toLowerCase().includes(phrase)
    );
  });

  displayFn = (categoryId: Category['id']) => {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  }

  focus() {
    this.inputElement()?.nativeElement.focus();
  }
}
