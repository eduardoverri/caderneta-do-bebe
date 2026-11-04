import { Component, inject } from '@angular/core';
import { RoutineStore } from '../../../../core/state/routine.store';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-daily-summary-cards',
  standalone: true,
  imports: [DurationPipe],
  template: `
    <div class="grid-3">
      <!-- Card 1: Última Mamada / Alimentação -->
      <div class="card" style="border-top: 4px solid var(--cat-feeding); padding: 0.85rem 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-feeding">🤱 ALIMENTAÇÃO</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">
            Próx. mama: {{ store.lastBreastSide() === 'Left' ? 'Direita' : 'Esquerda' }}
          </span>
        </div>
        <div style="font-size: 1.08rem; font-weight: 800; margin-top: 0.45rem;">
          {{ store.lastFeedingSummary() }}
        </div>
      </div>

      <!-- Card 2: Troca de Fraldas e Hidratação -->
      <div class="card" style="border-top: 4px solid var(--cat-diaper); padding: 0.85rem 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-diaper">🧷 FRALDAS HOJE</span>
          <span style="font-size: 0.75rem; font-weight: 700;">
            {{ store.urineOrMixedCount() }}💧 • {{ store.stoolOrMixedCount() }}💩 ({{ store.totalDiaperChanges() }} total)
          </span>
        </div>
        <div style="font-size: 1.08rem; font-weight: 800; margin-top: 0.45rem;">
          {{ store.lastDiaperSummary() }}
        </div>
        @if (store.isLowHydrationAlert()) {
          <div style="font-size: 0.76rem; color: var(--cat-health); font-weight: 700; margin-top: 0.2rem;">
            ⚠️ {{ store.hydrationStatusMessage() }}
          </div>
        }
      </div>

      <!-- Card 3: Sono do Dia -->
      <div class="card" style="border-top: 4px solid var(--cat-sleep); padding: 0.85rem 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-sleep">💤 SONO HOJE</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">
            Meta: {{ store.expectedNaps() }} sonecas
          </span>
        </div>
        <div style="font-size: 1.08rem; font-weight: 800; margin-top: 0.45rem;">
          {{ store.napCount() }}/{{ store.expectedNaps() }} sonecas ({{ store.totalSleepMinutes() | duration }})
        </div>
      </div>
    </div>
  `
})
export class DailySummaryCardsComponent {
  readonly store = inject(RoutineStore);
}
