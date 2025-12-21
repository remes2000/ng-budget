import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { BudgetEntry, Category } from '@models';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { CategoryNamePipe } from '@pipes/category-name.pipe';
import { Field, form, min, required } from '@angular/forms/signals';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { SelectCategory } from '@controls/select-category/select-category';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { BudgetService } from '@data-access/budget.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-single-entry',
  imports: [DatePipe, InternalCurrencyPipe, CategoryNamePipe, Field, MatFormField, MatLabel, MatInput, SelectCategory, MatIcon, MatIconButton, MatTooltip],
  templateUrl: './single-entry.html',
  styleUrl: './single-entry.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleEntry {
  entry = input.required<BudgetEntry>();
  model = signal<{ category: Category['id'], amount: number, comment: string }>({ category: '', amount: 0, comment: '' });
  form = form(this.model, (schema) => {
    required(schema.category);
    required(schema.amount);
    min(schema.amount, 0.01);
  });
  mode = signal<'view' | 'edit'>('view');

  private budgetService = inject(BudgetService);
  private amountInput = viewChild<ElementRef<HTMLInputElement>>('amountInput');
  private categorySelect = viewChild<SelectCategory>('categorySelect');
  private commentInput = viewChild<ElementRef<HTMLInputElement>>('commentInput');

  edit(field: 'amount' | 'category' | 'comment') {
    this.mode.set('edit');
    this.model.set({ category: this.entry().category, amount: this.entry().amount / 100, comment: this.entry().comment ?? '' });
    setTimeout(() => {
      if (field === 'amount') {
        this.amountInput()?.nativeElement.focus();
        this.amountInput()?.nativeElement.select();
      } else if ( field === 'comment') {
        this.commentInput()?.nativeElement.focus();
        this.commentInput()?.nativeElement.select();
      } else {
        this.categorySelect()?.focus();
      }
    });
  }

  submit() {
    if (this.form().invalid()) {
      this.form().markAsTouched();
    } else {
      const { category, amount, comment } = this.model();
      this.budgetService.update(this.entry().id, category, amount, comment);
      this.mode.set('view');
    }
  }

  abort() {
    this.form().reset();
    this.mode.set('view');
  }

  delete() {
    const confirmed = confirm('Are you sure you want to delete this entry?');
    if (confirmed) {
      this.budgetService.delete(this.entry().id);
    }
  }
}
