import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '@angular/common';

@Pipe({
  name: 'internalCurrency'
})
export class InternalCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    return formatCurrency(value / 100, 'pl-PL', '');
  }
}
