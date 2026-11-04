import { Component, inject } from '@angular/core';
import { BabyStore } from '../../../../core/state/baby.store';
import { RoutineStore } from '../../../../core/state/routine.store';
import { BabyAgePipe } from '../../../../shared/pipes/baby-age.pipe';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-milestone-timeline-tree',
  standalone: true,
  imports: [BabyAgePipe, OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-milestone);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <h3 class="section-title" style="margin-bottom: 0.2rem;">
            <span aria-hidden="true">🏆</span>
            <span>Vigilância do Desenvolvimento Infantil — Avaliação dos Marcos de Desenvolvimento (pág. 78 a 86)</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            As etapas do desenvolvimento da sua filha podem ser acompanhadas de acordo com alguns marcos que estão contidos nesta Caderneta. Eles ajudam os trabalhadores de saúde e os familiares a identificar precocemente problemas no desenvolvimento da criança, permitindo que o apoio necessário seja oferecido mais rápido. Caso a criança tenha nascido prematura (&lt; 37 semanas), é preciso corrigir a sua idade, diminuindo da idade atual o tempo que faltou para completar 40 semanas ou 9 meses de gestação (pág. 40, 79 e 89).
          </p>
        </div>

        <span class="badge badge-milestone">
          <span aria-hidden="true">👶</span>
          <span>Idade Avaliada: {{ babyStore.activeBaby() | babyAge }}</span>
        </span>
      </div>

      <div class="card-elevated" style="margin-bottom: 1rem; font-size: 0.83rem; color: var(--text-secondary);">
        <strong>📋 Instrumento de Avaliação do Desenvolvimento Integral da Criança (pág. 79 e 80):</strong>
        Legenda oficial da Caderneta: <strong>P = marco presente</strong> • <strong>A = marco ausente</strong> • <strong>NV = marco não verificado</strong>. Ao final da faixa etária, a criança deve ter atingido todos os marcos previstos. Classificações: <strong>Desenvolvimento Adequado</strong> (todos os reflexos/posturas/habilidades presentes para a sua faixa etária), <strong>Alerta para o Desenvolvimento</strong> (ausência de 1 ou mais marcos para a sua faixa etária ou presença de fator de risco) ou <strong>Provável Atraso no Desenvolvimento</strong> (PC &lt; -2Z ou &gt; +2Z, 3 ou mais alterações fenotípicas ou ausência de 1 ou mais marcos para a faixa etária anterior).
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        @for (m of routineStore.milestones(); track m.milestoneCode) {
          <div class="card-elevated" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.3rem;">
                <span class="badge badge-milestone">{{ m.ageRangeLabel }}</span>
                <span class="badge">
                  {{ m.directionType === 'Cephalocaudal' ? '📋 Postura / Motor Amplo e Social' : '🤲 Coordenação / Linguagem e Interação' }}
                </span>
              </div>
              <div style="font-weight: 800; font-size: 1.02rem;">{{ m.title }}</div>
              <p style="font-size: 0.86rem; color: var(--text-secondary); margin-top: 0.2rem;">{{ m.description }}</p>
              @if (m.notes) {
                <p style="font-size: 0.82rem; color: var(--cat-diaper); font-weight: 600; margin-top: 0.3rem;">
                  📝 {{ m.notes }}
                </p>
              }
            </div>

            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <button
                type="button"
                class="btn"
                style="min-height: 36px; font-size: 0.8rem;"
                [class.btn-diaper]="m.status === 'Achieved'"
                (click)="routineStore.updateMilestoneStatus(m.milestoneCode, 'Achieved')">
                <span aria-hidden="true">✅</span>
                <span>P — Marco Presente</span>
              </button>

              <button
                type="button"
                class="btn"
                style="min-height: 36px; font-size: 0.8rem;"
                [class.btn-milestone]="m.status === 'InProgress'"
                (click)="routineStore.updateMilestoneStatus(m.milestoneCode, 'InProgress')">
                <span aria-hidden="true">⏳</span>
                <span>Em Estimulação / NV</span>
              </button>
            </div>
          </div>
        }
      </div>

      <app-official-reference page="Caderneta da Criança, p. 37 a 52: estimulando o desenvolvimento com afeto; p. 53: sinais de alerta; p. 78 a 85: vigilância e marcos do desenvolvimento" />
    </div>
  `
})
export class MilestoneTimelineTreeComponent {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);
}
