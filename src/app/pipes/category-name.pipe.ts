import { Pipe, PipeTransform, inject } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';

@Pipe({
  name: 'categoryName'
})
export class CategoryNamePipe implements PipeTransform {
  private budgetService = inject(BudgetService);

  transform(categoryId: string): string {
    const category = this.budgetService.categories().find(c => c.id === categoryId);
    return category?.name ?? categoryId;
  }
}
