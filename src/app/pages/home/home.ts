import { ChangeDetectionStrategy, Component, effect, inject, signal, viewChild } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AddEntryForm } from './components/add-entry-form/add-entry-form';
import { EntriesOverview } from './components/entries-overview/entries-overview';
import { BudgetService } from '@data-access/budget.service';

@Component({
  selector: 'app-home',
  imports: [AddEntryForm, EntriesOverview, MatDrawer, MatDrawerContainer, MatDrawerContent, MatIconButton, MatIcon],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
  protected entries = inject(BudgetService).entries;
  protected drawerOpened = signal(true);
  private addEntryForm = viewChild(AddEntryForm);

  constructor() {
    effect(() => {
      if (this.drawerOpened()) {
        setTimeout(() => {
          this.addEntryForm()?.focusAmountInput();
        });
      }
    });
  }

  toggleDrawer() {
    this.drawerOpened.update(opened => !opened);
  }
}
