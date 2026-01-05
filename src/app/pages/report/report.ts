import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';
import { GroupComponent } from './components/group/group';
import { SummaryComponent } from './components/summary/summary';
import { PrintError } from 'src/app/components/app-print-error/app-print-error';

@Component({
  selector: 'app-report',
  imports: [ GroupComponent, SummaryComponent, PrintError ],
  templateUrl: './report.html',
  styleUrl: './report.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Report {
  #budgetService = inject(BudgetService);
  error = this.#budgetService.reportResource.error;
  groups = this.#budgetService.sortedGroups;
}
