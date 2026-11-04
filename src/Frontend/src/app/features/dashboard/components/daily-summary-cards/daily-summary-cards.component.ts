import { Component, inject } from '@angular/core';
import { RoutineStore } from '../../../../core/state/routine.store';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-daily-summary-cards',
  standalone: true,
  imports: [DurationPipe, OfficialReferenceComponent],
  template: `
    <div class="grid-3" style="margin: 1rem 0;">
      <!-- Card 1: Última Mamada / Alimentação -->
      <div class="card" style="border-top: 4px solid var(--cat-feeding);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-feeding">
            <span aria-hidden="true">🤱</span>
            <span>ÚLTIMA ALIMENTAÇÃO</span>
          </span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Próx. peito: {{ store.lastBreastSide() === 'Left' ? 'Direito' : 'Esquerdo' }}</span>
        </div>
        <div style="font-size: 1.15rem; font-weight: 800; margin-top: 0.6rem;">
          {{ store.lastFeedingSummary() }}
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Amamentação sem horários fixos (em geral 8 a 12 vezes ao dia) • alimentos a partir dos 6 meses
        </div>
      </div>

      <!-- Card 2: A Troca de Fraldas, as Fezes e a Hidratação -->
      <div class="card" style="border-top: 4px solid var(--cat-diaper);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-diaper">
            <span aria-hidden="true">🧷</span>
            <span>TROCA DE FRALDAS & FEZES</span>
          </span>
          <span style="font-size: 0.78rem; font-weight: 700;">{{ store.totalDiaperChanges() }} trocas hoje</span>
        </div>
        <div style="font-size: 1.15rem; font-weight: 800; margin-top: 0.6rem;">
          {{ store.lastDiaperSummary() }}
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">
          @if (store.isLowHydrationAlert()) {
            <span aria-hidden="true">⚠️</span> {{ store.hydrationStatusMessage() }}
          } @else {
            <span aria-hidden="true">✅</span> {{ store.urineOrMixedCount() }} urinas • {{ store.stoolOrMixedCount() }} evacuações (higiene com água morna, sem talco)
          }
        </div>
      </div>

      <!-- Card 3: O Sono da Criança -->
      <div class="card" style="border-top: 4px solid var(--cat-sleep);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-sleep">
            <span aria-hidden="true">💤</span>
            <span>O SONO DA CRIANÇA</span>
          </span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Referência: {{ store.expectedNaps() }} sonecas</span>
        </div>
        <div style="font-size: 1.15rem; font-weight: 800; margin-top: 0.6rem;">
          {{ store.napCount() }} de {{ store.expectedNaps() }} sonecas ({{ store.totalSleepMinutes() | duration }})
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Tempo médio acordada entre períodos de sono: {{ store.napTransition().averageRealWakeWindowMinutes | duration }}
        </div>
      </div>
    </div>
    <app-official-reference page="Caderneta da Criança — Menina (5ª ed.), p. 17: o sono; p. 18 e 21: troca de fraldas, fezes e desidratação; p. 24 e 31: amamentação e alimentação" />
  `
})
export class DailySummaryCardsComponent {
  readonly store = inject(RoutineStore);
}
