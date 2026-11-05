import { Component, OnInit, inject, signal } from '@angular/core';
import { DoseCalculatorComponent } from './components/dose-calculator/dose-calculator.component';
import { IntervalCountdownComponent } from './components/interval-countdown/interval-countdown.component';
import { VaccineCardComponent } from './components/vaccine-card/vaccine-card.component';
import { BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';

@Component({
  selector: 'app-health-medications',
  standalone: true,
  imports: [
    DoseCalculatorComponent,
    IntervalCountdownComponent,
    VaccineCardComponent
  ],
  template: `
    <div class="segmented-bar" role="tablist" aria-label="Saúde e Vacinação">
      <button type="button" class="segmented-btn" [class.active]="activeView() === 'VACCINES'" (click)="activeView.set('VACCINES')">
        <span>💉</span>
        <span>Carteira de Vacinação (SUS &amp; Campanhas)</span>
      </button>
      <button type="button" class="segmented-btn" [class.active]="activeView() === 'MEDICATIONS'" (click)="activeView.set('MEDICATIONS')">
        <span>💊</span>
        <span>Calculadora de Dose Segura &amp; Suplementos</span>
      </button>
    </div>

    @if (activeView() === 'VACCINES') {
      <app-vaccine-card />
    } @else {
      <div class="grid-2">
        <app-dose-calculator />
        <app-interval-countdown />
      </div>
    }
  `
})
export class HealthComponent implements OnInit {
  private readonly babyStore = inject(BabyStore);
  private readonly routineStore = inject(RoutineStore);
  private readonly loadingOverlay = inject(LoadingOverlayService);

  readonly activeView = signal<'VACCINES' | 'MEDICATIONS'>('VACCINES');

  async ngOnInit(): Promise<void> {
    const babyId = this.babyStore.selectedBabyId();
    if (babyId) {
      await this.loadingOverlay.runWithLoading(
        () => this.routineStore.refreshHealth(babyId),
        'Carregando carteira de vacinas e saúde...'
      );
    }
  }
}
