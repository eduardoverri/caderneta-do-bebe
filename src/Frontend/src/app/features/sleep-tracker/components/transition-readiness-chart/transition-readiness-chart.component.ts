import { Component, inject } from '@angular/core';
import { RoutineStore } from '../../../../core/state/routine.store';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-transition-readiness-chart',
  standalone: true,
  imports: [OfficialReferenceComponent],
  template: `
    @if (store.napTransition(); as tr) {
      <div class="card" style="border-top: 4px solid var(--cat-milestone);">
        <h3 class="section-title">
          <span aria-hidden="true">📊</span>
          <span>Transição de Sonecas e Ritmo Diário</span>
        </h3>

        <div class="card-elevated">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="font-size: 0.74rem; color: var(--text-secondary); font-weight: 700;">ESTÁGIO ATUAL DE TRANSIÇÃO</div>
              <div style="font-size: 1.05rem; font-weight: 800; margin-top: 0.15rem;">{{ tr.targetTransition }}</div>
            </div>
            <span class="badge" [class]="tr.isTransitionRecommended ? 'badge-milestone' : 'badge-sleep'">
              <span aria-hidden="true">{{ tr.isTransitionRecommended ? '🔔' : '🛡️' }}</span>
              <span>{{ tr.daysWithResistanceLast10Days }}/{{ tr.requiredConsecutiveDaysThreshold }} dias com resistência</span>
            </span>
          </div>
          <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
            {{ tr.clinicalRecommendation }}
          </p>
        </div>

        <details class="info-disclosure">
          <summary>💡 Orientações sobre Ritmo, Choro e Idade Corrigida (pág. 16 a 19, 41 e 42)</summary>
          <div class="info-disclosure-body">
            <ul>
              <li><strong>Recém-nascido (pág. 16, 17 e 24):</strong> Mama de 8 a 12 vezes ao dia em livre demanda, sem horários fixos.</li>
              <li><strong>2 a 4 meses (pág. 41):</strong> Criar gradualmente rotina de mamadas, banho e brincar no tempo acordada.</li>
              <li><strong>6 a 9 meses (pág. 42):</strong> Rotina diária mais estruturada de dormir, comer e brincar junto à família.</li>
              <li><strong>Choro e Colo (pág. 16 e 38):</strong> Bebês não ficam viciados em colo; acolher dá segurança emocional.</li>
            </ul>
            <app-official-reference page="p. 16–19, 24, 38, 41 e 42" />
          </div>
        </details>
      </div>
    }
  `
})
export class TransitionReadinessChartComponent {
  readonly store = inject(RoutineStore);
}
