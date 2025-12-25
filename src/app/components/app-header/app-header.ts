import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { DrawerService } from '../../drawer.service';
import { BudgetService } from '../../data-access/budget.service';

@Component({
  selector: 'app-header',
  imports: [MatIconButton, MatIcon, MatFormField, MatLabel, MatSelect, MatOption],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeader {
  private drawerService = inject(DrawerService);
  private budgetService = inject(BudgetService);

  protected readonly months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  protected readonly years = [2025, 2026, 2027, 2028, 2029, 2030];

  protected selectedMonth = this.budgetService.month;
  protected selectedYear = this.budgetService.year;

  protected toggleDrawer(): void {
    this.drawerService.toggleDrawer();
  }

  protected onMonthChange(month: number): void {
    this.budgetService.setMonth(month);
  }

  protected onYearChange(year: number): void {
    this.budgetService.setYear(year);
  }

  protected onDumpData(): void {
    // const report = this.budgetService.report();
    const report = {};
    const month = this.selectedMonth();
    const year = this.selectedYear();
    const timestamp = Date.now();
    const filename = `budget_dump_${month}_${year}_${timestamp}.json`;

    this.downloadAsJson(report, filename);
  }

  private downloadAsJson(data: unknown, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }
}
