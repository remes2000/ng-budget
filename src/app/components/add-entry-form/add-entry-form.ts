import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { Field, form, min, required } from '@angular/forms/signals';
import { BudgetService } from '@data-access/budget.service';
import { SelectCategory } from '@controls/select-category/select-category';

@Component({
  selector: 'app-add-entry-form',
  imports: [Field, MatFormField, MatLabel, MatInput, MatButton, SelectCategory],
  templateUrl: './add-entry-form.html',
  styleUrl: './add-entry-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEntryForm {
  private amountInput = viewChild<ElementRef<HTMLInputElement>>('amountInput');
  #budgetService = inject(BudgetService);

  protected model = signal({
    amount: 0,
    category: ''
  });
  protected form = form(this.model, (schemaPath) => {
    required(schemaPath.amount);
    min(schemaPath.amount, 0.01);
    required(schemaPath.category);
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
    } else {
      this.form().markAsTouched();
    }
  }
}
