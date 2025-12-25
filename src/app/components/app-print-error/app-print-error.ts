import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-print-error',
  imports: [ JsonPipe ],
  templateUrl: './app-print-error.html',
  styleUrl: './app-print-error.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintError {
  error = input<Error | undefined>();
}
