import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {
  private _drawerOpened = signal(true);

  readonly drawerOpened = this._drawerOpened.asReadonly();

  toggleDrawer(): void {
    this._drawerOpened.update(opened => !opened);
  }
}
