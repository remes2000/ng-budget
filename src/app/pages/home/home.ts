import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EntriesOverview } from './components/entries-overview/entries-overview';
import { BudgetService } from '@data-access/budget.service';

@Component({
  selector: 'app-home',
  imports: [EntriesOverview],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
  protected entries = inject(BudgetService).entries;
}
