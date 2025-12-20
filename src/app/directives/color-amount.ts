import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[colorAmount]',
  host: { '[style.color]': 'color()' }
})
export class ColorAmount {
  colorAmount = input.required<number>();
  color = computed(() => {
    const amount = this.colorAmount();
    if (amount === 0) {
      return null;
    }
    return amount > 0 ? 'green' : 'red';
  });
}
