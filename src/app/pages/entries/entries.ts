import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EntriesOverview } from './components/entries-overview/entries-overview';
import { BudgetService } from '@data-access/budget.service';

@Component({
  selector: 'app-entries',
  imports: [EntriesOverview],
  templateUrl: './entries.html',
  styleUrl: './entries.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Entries {
  protected entries = inject(BudgetService).entries;
}
