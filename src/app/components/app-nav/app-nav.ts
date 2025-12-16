import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';

@Component({
  selector: 'app-app-nav',
  imports: [RouterLink, RouterLinkActive, MatTabNav, MatTabLink, MatTabNavPanel],
  templateUrl: './app-nav.html',
  styleUrl: './app-nav.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNav {

}
