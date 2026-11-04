import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { PopupAlertService } from '../../core/services/popup-alert.service';
import { BabyAgePipe } from '../../shared/pipes/baby-age.pipe';
import { OfficialReferenceComponent } from '../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-growth-tracker',
  standalone: true,
  imports: [FormsModule, DatePipe, BabyAgePipe, OfficialReferenceComponent],
  template: `
    @if (babyStore.activeBaby(); as baby) {
      <div class="grid-2" style="margin-bottom: 1.25rem;">
        <!-- Formulário de Registro de Nova Aferição Antropométrica & Gráficos de Crescimento Infantil -->
        <section class="card" style="border-top: 4px solid var(--cat-diaper);">
          <h3 class="section-title">
            <span aria-hidden="true">📈</span>
            <span>Vigilância do Crescimento Infantil — Registro de Medidas e Curvas OMS/MS (pág. 88 a 100)</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Criança: <strong>{{ baby.name }}</strong> ({{ baby | babyAge }}) •
            O melhor método de acompanhamento do crescimento infantil é o registro periódico do perímetro cefálico (até 2 anos), do peso, do comprimento (menores de 2 anos, medidas deitadas) ou da estatura (2 anos ou mais, medidas em pé) e do índice de massa corporal (IMC) na Caderneta da Criança.
          </p>

          <div class="grid-2" style="margin-bottom: 0.85rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Data da Consulta / Aferição</label>
              <input
                type="date"
                class="input-field"
                [ngModel]="measuredAtDate()"
                (ngModelChange)="measuredAtDate.set($event)" />
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Peso (g)</label>
              <input
                type="number"
                class="input-field"
                [ngModel]="weightGrams()"
                (ngModelChange)="weightGrams.set(+$event)"
                min="500"
                max="30000"
                step="10" />
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Comprimento (&lt; 2 anos, deitada) / Estatura (≥ 2 anos, em pé) (cm)</label>
              <input
                type="number"
                class="input-field"
                [ngModel]="heightCm()"
                (ngModelChange)="heightCm.set(+$event)"
                min="30"
                max="130"
                step="0.1" />
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Perímetro Cefálico — PC (cm) (até 2 anos)</label>
              <input
                type="number"
                class="input-field"
                [ngModel]="headCircumferenceCm()"
                (ngModelChange)="headCircumferenceCm.set(+$event)"
                min="20"
                max="65"
                step="0.1" />
            </div>
          </div>

          <div class="card-elevated" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">
                CLASSIFICAÇÃO DO PESO PARA A IDADE (ESCORE-Z OMS/MS — PÁG. 92, 95 E 98)
              </div>
              <div style="font-size: 1.05rem; font-weight: 800; margin-top: 0.2rem;">
                Z = {{ formatZScore(effectiveZScore()) }} • {{ classifyZScore(effectiveZScore()) }}
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label style="font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                <input
                  type="checkbox"
                  [ngModel]="useCustomZScore()"
                  (ngModelChange)="useCustomZScore.set($event)" />
                <span>Informar Escore-z manual</span>
              </label>

              @if (useCustomZScore()) {
                <input
                  type="number"
                  step="0.1"
                  min="-4"
                  max="4"
                  class="input-field"
                  style="width: 90px; min-height: 36px; padding: 0.25rem 0.5rem;"
                  [ngModel]="customZScore()"
                  (ngModelChange)="customZScore.set(+$event)" />
              }
            </div>
          </div>

          <button
            type="button"
            class="btn btn-diaper"
            style="width: 100%;"
            (click)="saveGrowthLog()">
            <span aria-hidden="true">📏</span>
            <span>Salvar Medidas no Acompanhamento do Crescimento</span>
          </button>
        </section>

        <!-- Resumo Atual de Medidas e Interpretação dos Gráficos -->
        <section class="card" style="border-top: 4px solid var(--cat-sleep);">
          <h3 class="section-title">
            <span aria-hidden="true">👶</span>
            <span>Medidas Atuais e Interpretação dos Gráficos (pág. 88 e 89)</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Curvas da OMS/MS (<strong>{{ baby.gender === 'F' ? 'Meninas' : 'Meninos' }}</strong>). Para recém-nascidos pré-termo (&lt; 37 semanas), utilizar o gráfico Intergrowth-21 (27 a 64 semanas pós-concepcionais, pág. 90) ou corrigir a idade cronológica (40 semanas menos IG do nascimento em semanas) até 2 anos de idade cronológica (ou até 3 anos se IG &lt; 28 semanas, pág. 89).
          </p>

          <div class="grid-2">
            <div class="card-elevated">
              <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700;">PESO ATUAL</div>
              <div style="font-size: 1.3rem; font-weight: 800; margin-top: 0.2rem;">
                {{ baby.currentWeightGrams }} g
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem;">
                Ao nascer: {{ baby.birthWeightGrams }} g
              </div>
            </div>

            <div class="card-elevated">
              <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700;">COMPRIMENTO / ESTATURA ATUAL</div>
              <div style="font-size: 1.3rem; font-weight: 800; margin-top: 0.2rem;">
                {{ baby.currentHeightCm }} cm
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem;">
                Ao nascer: {{ baby.birthLengthCm }} cm (Dif. deitada/em pé: 0,7 cm — pág. 88)
              </div>
            </div>

            <div class="card-elevated">
              <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700;">PERÍMETRO CEFÁLICO (PC)</div>
              <div style="font-size: 1.3rem; font-weight: 800; margin-top: 0.2rem;">
                {{ baby.headCircumferenceCm }} cm
              </div>
              <div style="font-size: 0.78rem; color: var(--cat-diaper); font-weight: 600; margin-top: 0.15rem;">
                Adequado entre -2 e +2 escores-z (pág. 78 e 91)
              </div>
            </div>

            <div class="card-elevated">
              <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700;">ÍNDICE DE MASSA CORPORAL (IMC)</div>
              <div style="font-size: 1.3rem; font-weight: 800; margin-top: 0.2rem;">
                {{ calculateBmi(baby.currentWeightGrams, baby.currentHeightCm) }} kg/m²
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem;">
                IMC = Peso (kg) / Estatura² (m) (pág. 88, 94, 97 e 100)
              </div>
            </div>
          </div>

          <div class="card-elevated" style="margin-top: 0.85rem; font-size: 0.82rem; color: var(--text-secondary);">
            <strong>🔍 Interpretando os Gráficos (pág. 89):</strong>
            A curva de crescimento de uma criança que está crescendo adequadamente tende a seguir um traçado paralelo à linha verde (escore-z 0), acima ou abaixo dela. Qualquer mudança rápida que desvie a curva da criança para cima ou para baixo, ou então um traçado horizontal, devem ser investigados.
          </div>
        </section>
      </div>

      <!-- Tabela de Registro de Medidas e Classificação OMS/MS -->
      <section class="card">
        <h3 class="section-title">
          <span aria-hidden="true">📊</span>
          <span>Registros de Medidas Antropométricas e Classificação do Peso para a Idade (pág. 77 e 91 a 100)</span>
        </h3>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                <th style="padding: 0.55rem;">Data</th>
                <th style="padding: 0.55rem;">Peso (g)</th>
                <th style="padding: 0.55rem;">Comprimento / Estatura (cm)</th>
                <th style="padding: 0.55rem;">Perímetro Cefálico (cm)</th>
                <th style="padding: 0.55rem;">IMC</th>
                <th style="padding: 0.55rem;">Escore-z (Peso para a Idade — pág. 92)</th>
              </tr>
            </thead>
            <tbody>
              @for (g of baby.growthLogs; track g.measuredAt + '-' + g.weightGrams) {
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 0.55rem;">{{ g.measuredAt | date:'dd/MM/yyyy' }}</td>
                  <td style="padding: 0.55rem; font-weight: 700;">{{ g.weightGrams }} g</td>
                  <td style="padding: 0.55rem;">{{ g.heightCm }} cm</td>
                  <td style="padding: 0.55rem;">{{ g.headCircumferenceCm }} cm</td>
                  <td style="padding: 0.55rem;">{{ calculateBmi(g.weightGrams, g.heightCm) }}</td>
                  <td style="padding: 0.55rem;">
                    <span class="badge" [class.badge-diaper]="g.zScoreWeightForAge >= -2 && g.zScoreWeightForAge <= 2" [class.badge-milestone]="g.zScoreWeightForAge < -2 || g.zScoreWeightForAge > 2">
                      Z = {{ formatZScore(g.zScoreWeightForAge) }} ({{ classifyZScore(g.zScoreWeightForAge) }})
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-official-reference page="Caderneta da Criança, p. 77: outras medidas e consultas necessárias; p. 88: vigilância do crescimento infantil; p. 89: interpretando os gráficos; p. 90 a 100: gráficos de crescimento infantil OMS/MS" />
      </section>
    }
  `
})
export class GrowthTrackerComponent implements OnInit {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  readonly measuredAtDate = signal<string>(new Date().toISOString().slice(0, 10));
  readonly weightGrams = signal<number>(3200);
  readonly heightCm = signal<number>(49);
  readonly headCircumferenceCm = signal<number>(35);
  readonly useCustomZScore = signal<boolean>(false);
  readonly customZScore = signal<number>(0);

  constructor() {
    effect(() => {
      const b = this.babyStore.activeBaby();
      if (b && b.id) {
        this.weightGrams.set(b.currentWeightGrams || 3200);
        this.heightCm.set(b.currentHeightCm || 49);
        this.headCircumferenceCm.set(b.headCircumferenceCm || 35);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const b = this.babyStore.activeBaby();
    if (b && b.id) {
      this.weightGrams.set(b.currentWeightGrams || 3200);
      this.heightCm.set(b.currentHeightCm || 49);
      this.headCircumferenceCm.set(b.headCircumferenceCm || 35);
    }
  }

  readonly calculatedZScore = computed<number>(() => {
    const baby = this.babyStore.activeBaby();
    const measuredAtMs = this.measuredAtDate() ? new Date(this.measuredAtDate()).getTime() : Date.now();
    const birthMs = baby.birthDate ? new Date(baby.birthDate).getTime() : Date.now();
    const chronoDays = Math.max(0, Math.floor((measuredAtMs - birthMs) / 86400000));
    const prematureDays = baby.gestationalWeeks < 37
      ? (40 * 7) - (baby.gestationalWeeks * 7 + baby.gestationalDays)
      : 0;
    const effectiveDays = Math.max(0, chronoDays - prematureDays);

    const months = Math.min(24, Math.max(0, effectiveDays / 30.4375));
    const isFemale = (baby.gender || '').toUpperCase() === 'F';

    const refMonths = [0, 3, 6, 9, 12, 18, 24];
    const medians = isFemale
      ? [3232, 5845, 7297, 8225, 8948, 10231, 11477]
      : [3346, 6376, 7934, 8901, 9647, 10938, 12151];
    const sds = isFemale
      ? [430, 680, 820, 920, 1000, 1140, 1280]
      : [450, 720, 860, 960, 1040, 1180, 1320];

    let i = 0;
    while (i < refMonths.length - 2 && months > refMonths[i + 1]) {
      i++;
    }

    const t = (months - refMonths[i]) / (refMonths[i + 1] - refMonths[i]);
    const median = medians[i] + t * (medians[i + 1] - medians[i]);
    const sd = sds[i] + t * (sds[i + 1] - sds[i]);

    const z = (this.weightGrams() - median) / sd;
    return +Math.min(4, Math.max(-4, z)).toFixed(2);
  });

  readonly effectiveZScore = computed<number>(() =>
    this.useCustomZScore() ? this.customZScore() : this.calculatedZScore()
  );

  formatZScore(z: number): string {
    return z > 0 ? `+${z}` : `${z}`;
  }

  classifyZScore(z: number): string {
    if (z < -3) return 'Peso muito baixo para a idade';
    if (z < -2) return 'Peso baixo para a idade';
    if (z > 2) return 'Peso elevado para a idade';
    return 'Peso adequado para a idade';
  }

  calculateBmi(weightGrams: number, heightCm: number): string {
    if (!weightGrams || !heightCm || heightCm <= 0) return '-';
    const weightKg = weightGrams / 1000;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  }

  async saveGrowthLog(): Promise<void> {
    if (!this.measuredAtDate()) {
      this.popupAlert.incompleteForm('Informe a data da aferição antropométrica.');
      return;
    }
    if (!this.weightGrams() || this.weightGrams() <= 0) {
      this.popupAlert.incompleteForm('Informe o peso aferido em gramas.');
      return;
    }
    if (!this.heightCm() || this.heightCm() <= 0) {
      this.popupAlert.incompleteForm('Informe o comprimento/estatura em centímetros.');
      return;
    }
    if (!this.headCircumferenceCm() || this.headCircumferenceCm() <= 0) {
      this.popupAlert.incompleteForm('Informe o perímetro cefálico em centímetros.');
      return;
    }

    const measuredAtIso = new Date(`${this.measuredAtDate()}T12:00:00`).toISOString();

    await this.routineStore.logGrowthMeasurement({
      measuredAt: measuredAtIso,
      weightGrams: this.weightGrams(),
      heightCm: this.heightCm(),
      headCircumferenceCm: this.headCircumferenceCm(),
      zScoreWeightForAge: this.effectiveZScore()
    });
  }
}
