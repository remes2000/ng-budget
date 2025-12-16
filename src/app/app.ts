import { Component, effect, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { AddEntryForm } from './components/add-entry-form/add-entry-form';
import { AppHeader } from './components/app-header/app-header';
import { AppNav } from './components/app-nav/app-nav';
import { DrawerService } from './drawer.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatDrawer, MatDrawerContainer, MatDrawerContent, AddEntryForm, AppHeader, AppNav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private drawerService = inject(DrawerService);
  protected drawerOpened = this.drawerService.drawerOpened;
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
}
