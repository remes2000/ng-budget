import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { Field, form } from '@angular/forms/signals';
import { Category } from '../../../../models';
import { JsonPipe } from '@angular/common';
import { BudgetService } from '../../../../data-access/budget.service';

@Component({
  selector: 'app-add-entry-form',
  imports: [Field, MatFormField, MatLabel, MatInput, MatAutocomplete, MatAutocompleteTrigger, MatOption, MatButton, JsonPipe],
  templateUrl: './add-entry-form.html',
  styleUrl: './add-entry-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEntryForm {
  private amountInput = viewChild<ElementRef<HTMLInputElement>>('amountInput');
  #budgetService = inject(BudgetService);

  protected model = signal({
    amount: 0,
    category: '' as Category['id']
  });
  protected form = form(this.model);

  #categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];
  #categorySearch = signal('');

  filteredCategories = computed(() => {
    const search = this.#categorySearch().toLowerCase();
    return this.#categories.filter(cat => cat.toLowerCase().includes(search));
  });

  focusAmountInput() {
    this.amountInput()?.nativeElement.focus();
  }

  submit(event: SubmitEvent) {
    event.preventDefault();
    if (this.form().valid()) {
      const { amount, category } = this.model();
      this.#budgetService.add(amount, category);
      this.form().reset();
      this.model.set({ amount: 0, category: '' });
      this.focusAmountInput();
    }
  }
}
