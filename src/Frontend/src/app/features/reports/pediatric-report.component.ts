import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';
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
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.85rem;">
          <div>
            <span class="badge badge-sleep">RESUMO CLÍNICO PARA CONSULTA PEDIÁTRICA</span>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin-top: 0.25rem;">{{ baby.name }} ({{ baby | babyAge }})</h2>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">
              IG: {{ baby.gestationalWeeks }}s {{ baby.gestationalDays }}d • Sangue: {{ baby.bloodType }} • Pediatra: {{ baby.pediatrician.name }} (CRM {{ baby.pediatrician.crm }})
            </p>
          </div>

          <button type="button" class="btn btn-sleep no-print" (click)="printReport()">
            <span aria-hidden="true">🖨️</span>
            <span>Exportar / Imprimir PDF</span>
          </button>
        </div>

        <!-- Métricas Consolidadas -->
        <div class="grid-4" style="margin-bottom: 1rem;">
          <div class="card-elevated">
            <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 700;">MEDIDAS ATUAIS</div>
            <div style="font-size: 1.1rem; font-weight: 800; margin-top: 0.15rem;">
              {{ baby.currentWeightGrams }}g • {{ baby.currentHeightCm }} cm
            </div>
            <div style="font-size: 0.76rem; color: var(--cat-diaper);">PC: {{ baby.headCircumferenceCm }} cm</div>
          </div>

          <div class="card-elevated">
            <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 700;">JANELA MÉDIA DE SONO</div>
            <div style="font-size: 1.1rem; font-weight: 800; margin-top: 0.15rem;">
              {{ routineStore.napTransition().averageRealWakeWindowMinutes | duration }}
            </div>
            <div style="font-size: 0.76rem; color: var(--text-secondary);">{{ routineStore.napCount() }} sonecas ({{ routineStore.totalSleepMinutes() | duration }})</div>
          </div>

          <div class="card-elevated">
            <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 700;">ELIMINAÇÕES HOJE</div>
            <div style="font-size: 1.1rem; font-weight: 800; margin-top: 0.15rem;">
              {{ routineStore.urineOrMixedCount() }}💧 • {{ routineStore.stoolOrMixedCount() }}💩
            </div>
            <div style="font-size: 0.76rem; color: var(--cat-diaper);">{{ routineStore.totalDiaperChanges() }} trocas registradas</div>
          </div>

          <div class="card-elevated">
            <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 700;">ALÉRGENOS EM TESTE</div>
            <div style="font-size: 1.1rem; font-weight: 800; margin-top: 0.15rem;">
              {{ routineStore.allergenTrials().length }} alimento(s)
            </div>
            <div style="font-size: 0.76rem; color: var(--text-secondary);">Monitoramento 72h</div>
          </div>
        </div>

        <!-- Tabela Antropométrica Resumida -->
        <h3 class="section-title">
          <span aria-hidden="true">📈</span>
          <span>Evolução Antropométrica (OMS/MS)</span>
        </h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                <th style="padding: 0.5rem;">Data</th>
                <th style="padding: 0.5rem;">Peso</th>
                <th style="padding: 0.5rem;">Estatura</th>
                <th style="padding: 0.5rem;">PC</th>
                <th style="padding: 0.5rem;">Escore-z (Peso/Idade)</th>
              </tr>
            </thead>
            <tbody>
              @for (g of baby.growthLogs; track g.measuredAt + '-' + g.weightGrams) {
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 0.5rem;">{{ g.measuredAt | date:'dd/MM/yyyy' }}</td>
                  <td style="padding: 0.5rem; font-weight: 700;">{{ g.weightGrams }} g</td>
                  <td style="padding: 0.5rem;">{{ g.heightCm }} cm</td>
                  <td style="padding: 0.5rem;">{{ g.headCircumferenceCm }} cm</td>
                  <td style="padding: 0.5rem;">
                    <span class="badge" [class.badge-diaper]="g.zScoreWeightForAge >= -2 && g.zScoreWeightForAge <= 2" [class.badge-milestone]="g.zScoreWeightForAge < -2 || g.zScoreWeightForAge > 2">
                      Z = {{ g.zScoreWeightForAge > 0 ? '+' + g.zScoreWeightForAge : g.zScoreWeightForAge }} ({{ classifyZScore(g.zScoreWeightForAge) }})
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <details class="info-disclosure no-print">
          <summary>💡 Calendário de Consultas Recomendadas pelo Ministério da Saúde (pág. 14 e 68 a 76)</summary>
          <div class="info-disclosure-body">
            <p>
              Idades recomendadas para consultas de rotina: <strong>1ª semana (3º ao 5º dia), 1 mês, 2 meses, 4 meses, 6 meses, 9 meses, 12 meses, 18 meses, 24 meses e 36 meses</strong>, além de consultas anuais após os 2 anos. Para registrar os dados detalhados de cada uma das 10 consultas, acesse a aba <strong>📘 Caderneta → 3. Consultas &amp; Agenda</strong>.
            </p>
            <app-official-reference page="p. 14 e 68 a 77" />
          </div>
        </details>
      </div>
    }
  `
})
export class PediatricReportComponent implements OnInit {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);
  private readonly loadingOverlay = inject(LoadingOverlayService);

  async ngOnInit(): Promise<void> {
    const babyId = this.babyStore.selectedBabyId();
    if (babyId) {
      await this.loadingOverlay.runWithLoading(
        () => this.routineStore.refreshReport(babyId),
        'Carregando resumo para consulta pediátrica...'
      );
    }
  }

  classifyZScore(z: number): string {
    if (z < -3) return 'Peso muito baixo';
    if (z < -2) return 'Peso baixo';
    if (z > 2) return 'Peso elevado';
    return 'Peso adequado';
  }

  printReport(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
