import { ChangeDetectionStrategy, Component, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';

@Component({
  selector: 'app-budget-value',
  imports: [MatFormField, MatInput, InternalCurrencyPipe],
  templateUrl: './budget-value.html',
  styleUrl: './budget-value.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetValue {
  amount = input.required<number>();
  amountChange = output<number>();

  mode = signal<'view' | 'edit'>('view');
  editValue = signal<number>(0);

  inputElement = viewChild<ElementRef<HTMLInputElement>>('budgetInput');

  constructor() {
    effect(() => {
      if (this.mode() === 'edit') {
        const input = this.inputElement();
        if (input) {
          input.nativeElement.focus();
          input.nativeElement.select();
        }
      }
    });
  }

  enterEditMode(): void {
    this.editValue.set(this.amount() / 100);
    this.mode.set('edit');
  }

  saveAndExit(): void {
    const value = this.editValue() ?? 0;
    this.amountChange.emit(value);
    this.mode.set('view');
  }

  exit(): void {
    this.mode.set('view');
  }

  onInputChange(value: string): void {
    this.editValue.set(Number(value));
  }
}
