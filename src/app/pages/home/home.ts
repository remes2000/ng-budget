import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [MatDrawer, MatDrawerContainer, MatDrawerContent, MatIconButton, MatIcon],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
  drawerOpened = signal(true);

  closeDrawer() {
    this.drawerOpened.set(false);
  }

  openDrawer() {
    this.drawerOpened.set(true);
  }
}
