import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { ComputationService } from '@data-access/computation.service';
import { InternalCurrencyPipe } from '@pipes/internal-currency.pipe';
import { ColorAmount } from 'src/app/directives/color-amount';

@Component({
  selector: 'app-summary',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, InternalCurrencyPipe, ColorAmount, DecimalPipe],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryComponent {
  #computationService = inject(ComputationService);

  expectedSpending = this.#computationService.expectedSpending;
  expectedEarnings = this.#computationService.expectedEarning;
  goal = this.#computationService.goal;

  actualSpending = this.#computationService.totalSpent;
  actualEarnings = this.#computationService.totalEarned;
  reality = this.#computationService.reality;

  percentageUsed = this.#computationService.budgetUsage;
  remaining = this.#computationService.remainingToSpend;
}
