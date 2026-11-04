import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { BabyAgePipe } from '../../shared/pipes/baby-age.pipe';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { OfficialReferenceComponent } from '../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-pediatric-report',
  standalone: true,
  imports: [DatePipe, BabyAgePipe, DurationPipe, OfficialReferenceComponent],
  template: `
    @if (babyStore.activeBaby(); as baby) {
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; border-bottom: 2px solid var(--border-strong); padding-bottom: 1rem;">
          <div>
            <span class="badge badge-sleep">PARTE II — REGISTROS DO ACOMPANHAMENTO DA CRIANÇA E CONSULTAS RECOMENDADAS (PÁG. 14 E 68 A 77)</span>
            <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.35rem;">Criança: {{ baby.name }}</h2>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Idade: <strong>{{ baby | babyAge }}</strong> • IG ao nascer: {{ baby.gestationalWeeks }} semanas e {{ baby.gestationalDays }} dias • Tipo Sanguíneo: {{ baby.bloodType }}
            </p>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Profissional / Pediatra de Referência: {{ baby.pediatrician.name }} (CRM {{ baby.pediatrician.crm }}) • Tel: {{ baby.pediatrician.emergencyPhone }}
            </p>
          </div>

          <button type="button" class="btn btn-sleep no-print" (click)="printReport()">
            <span aria-hidden="true">🖨️</span>
            <span>Exportar / Imprimir PDF para Consulta</span>
          </button>
        </div>

        <div class="card-elevated" style="margin-bottom: 1.25rem; font-size: 0.84rem; color: var(--text-secondary);">
          <strong>🩺 Consultas Recomendadas pelo Ministério da Saúde (Caderneta da Criança, pág. 14 e 68 a 76):</strong>
          Você deve levar a criança para fazer as consultas de rotina nas idades: <strong>Primeira semana (3º ao 5º dia) • 1 mês • 2 meses • 4 meses • 6 meses • 9 meses • 12 meses • 18 meses • 24 meses • 36 meses</strong>. A partir dos 2 anos de idade, as consultas de rotina devem ser feitas uma vez ao ano, de acordo com a necessidade de cuidados de sua filha. Leve sempre a Caderneta da Criança quando for com sua filha aos serviços de saúde, em todas as campanhas de vacinação, quando for matriculá-la na creche ou na escola ou quando procurar os serviços de assistência social (pág. 2).
        </div>

        <!-- Métricas Consolidadas -->
        <div class="grid-4" style="margin-bottom: 1.25rem;">
          <div class="card-elevated">
            <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">MEDIDAS ATUAIS (PÁG. 88)</div>
            <div style="font-size: 1.2rem; font-weight: 800; margin-top: 0.25rem;">
              {{ baby.currentWeightGrams }}g • {{ baby.currentHeightCm }} cm
            </div>
            <div style="font-size: 0.8rem; color: var(--cat-diaper);">PC: {{ baby.headCircumferenceCm }} cm (Adequado entre -2 e +2 escores-z)</div>
          </div>

          <div class="card-elevated">
            <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">TEMPO E ROTINA DO SONO (PÁG. 17 E 71)</div>
            <div style="font-size: 1.2rem; font-weight: 800; margin-top: 0.25rem;">
              {{ routineStore.napTransition().averageRealWakeWindowMinutes | duration }}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">{{ routineStore.napCount() }} sonecas diurnas ({{ routineStore.totalSleepMinutes() | duration }})</div>
          </div>

          <div class="card-elevated">
            <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">FUNCIONAMENTO DO INTESTINO E URINA (PÁG. 18 E 21)</div>
            <div style="font-size: 1.2rem; font-weight: 800; margin-top: 0.25rem;">
              {{ routineStore.urineOrMixedCount() }} Urinas • {{ routineStore.stoolOrMixedCount() }} Evacuações
            </div>
            <div style="font-size: 0.8rem; color: var(--cat-diaper);">Fezes normais (1 a 5): amareladas, esverdeadas ou amarronzadas</div>
          </div>

          <div class="card-elevated">
            <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">ALEITAMENTO / ALIMENTAÇÃO (PÁG. 24 E 31)</div>
            <div style="font-size: 1.2rem; font-weight: 800; margin-top: 0.25rem;">
              Esquema Alimentar Ativo
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Alimentos em observação: {{ routineStore.allergenTrials().length }}</div>
          </div>
        </div>

        <!-- Gráficos de Crescimento Infantil OMS/MS (Escore-z) -->
        <h3 class="section-title">
          <span aria-hidden="true">📈</span>
          <span>Vigilância do Crescimento Infantil e Gráficos OMS/MS (Peso para a Idade — pág. 88 a 100)</span>
        </h3>
        <div style="overflow-x: auto; margin-bottom: 1rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                <th style="padding: 0.55rem;">Data</th>
                <th style="padding: 0.55rem;">Peso (g)</th>
                <th style="padding: 0.55rem;">Comprimento / Estatura (cm)</th>
                <th style="padding: 0.55rem;">Perímetro Cefálico (cm)</th>
                <th style="padding: 0.55rem;">Escore-z (Classificação do Peso para a Idade)</th>
              </tr>
            </thead>
            <tbody>
              @for (g of baby.growthLogs; track g.measuredAt + '-' + g.weightGrams) {
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 0.55rem;">{{ g.measuredAt | date:'dd/MM/yyyy' }}</td>
                  <td style="padding: 0.55rem; font-weight: 700;">{{ g.weightGrams }} g</td>
                  <td style="padding: 0.55rem;">{{ g.heightCm }} cm</td>
                  <td style="padding: 0.55rem;">{{ g.headCircumferenceCm }} cm</td>
                  <td style="padding: 0.55rem;">
                    <span class="badge" [class.badge-diaper]="g.zScoreWeightForAge >= -2 && g.zScoreWeightForAge <= 2" [class.badge-milestone]="g.zScoreWeightForAge < -2 || g.zScoreWeightForAge > 2">
                      Z = {{ g.zScoreWeightForAge > 0 ? '+' + g.zScoreWeightForAge : g.zScoreWeightForAge }} ({{ classifyZScore(g.zScoreWeightForAge) }})
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-official-reference page="Caderneta da Criança, p. 2: apresentação; p. 14 e 15: consultas de rotina e triagem neonatal; p. 68 a 77: registros do acompanhamento da criança; p. 88 a 100: vigilância do crescimento infantil" />
      </div>
    }
  `
})
export class PediatricReportComponent {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);

  classifyZScore(z: number): string {
    if (z < -3) return 'Peso muito baixo para a idade';
    if (z < -2) return 'Peso baixo para a idade';
    if (z > 2) return 'Peso elevado para a idade';
    return 'Peso adequado para a idade';
  }

  printReport(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
