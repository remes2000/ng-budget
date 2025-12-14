import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BudgetEntry } from '@models';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { CategoryNamePipe } from '@pipes/category-name.pipe';

@Component({
  selector: 'app-single-entry',
  imports: [DatePipe, InternalCurrencyPipe, CategoryNamePipe],
  templateUrl: './single-entry.html',
  styleUrl: './single-entry.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleEntry {
  entry = input.required<BudgetEntry>();
}
