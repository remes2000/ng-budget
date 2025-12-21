import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BudgetService } from '@data-access/budget.service';
import { GroupComponent } from './components/group/group';
import { SummaryComponent } from './components/summary/summary';

@Component({
  selector: 'app-report',
  imports: [ GroupComponent, SummaryComponent ],
  templateUrl: './report.html',
  styleUrl: './report.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Report {
  groups = inject(BudgetService).groups;
}
