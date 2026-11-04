import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BabyStore, GrowthLog } from '../../core/state/baby.store';
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
      <!-- Faixa Superior de Indicadores Atuais (Dados Registrados em Destaque Limpo) -->
      <div class="grid-4" style="margin-bottom: 0.85rem;">
        <div class="card" style="padding: 0.75rem 0.9rem; border-top: 3px solid var(--cat-diaper);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">PESO ATUAL</div>
          <div style="font-size: 1.25rem; font-weight: 800; margin-top: 0.1rem;">{{ baby.currentWeightGrams }} g</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Ao nascer: {{ baby.birthWeightGrams }} g</div>
        </div>

        <div class="card" style="padding: 0.75rem 0.9rem; border-top: 3px solid var(--cat-sleep);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">COMPRIMENTO / ESTATURA</div>
          <div style="font-size: 1.25rem; font-weight: 800; margin-top: 0.1rem;">{{ baby.currentHeightCm }} cm</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Ao nascer: {{ baby.birthLengthCm }} cm</div>
        </div>

        <div class="card" style="padding: 0.75rem 0.9rem; border-top: 3px solid var(--cat-milestone);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">PERÍMETRO CEFÁLICO (PC)</div>
          <div style="font-size: 1.25rem; font-weight: 800; margin-top: 0.1rem;">{{ baby.headCircumferenceCm }} cm</div>
          <div style="font-size: 0.72rem; color: var(--cat-diaper); font-weight: 600;">Normal: -2 a +2 Z</div>
        </div>

        <div class="card" style="padding: 0.75rem 0.9rem; border-top: 3px solid var(--cat-feeding);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">IMC ATUAL</div>
          <div style="font-size: 1.25rem; font-weight: 800; margin-top: 0.1rem;">
            {{ calculateBmi(baby.currentWeightGrams, baby.currentHeightCm) }} <span style="font-size: 0.78rem; font-weight: 600;">kg/m²</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">{{ baby | babyAge }}</div>
        </div>
      </div>

      <!-- Barra Segmentada: separa Ação de Registro, Tabela Histórica e Gráficos Oficiais -->
      <div class="segmented-bar" role="tablist" aria-label="Vigilância do Crescimento">
        <button type="button" class="segmented-btn" [class.active]="activeTab() === 'HISTORY'" (click)="activeTab.set('HISTORY')">
          <span>📊</span>
          <span>Medidas Registradas ({{ baby.growthLogs.length }})</span>
        </button>
        <button type="button" class="segmented-btn" [class.active]="activeTab() === 'FORM'" (click)="activeTab.set('FORM')">
          <span>📏</span>
          <span>{{ editingGrowthId() ? 'Alterar Medida Selecionada' : 'Nova Medida & PA' }}</span>
        </button>
        <button type="button" class="segmented-btn" [class.active]="activeTab() === 'CHARTS'" (click)="activeTab.set('CHARTS')">
          <span>📉</span>
          <span>Curvas Oficiais OMS (pág. 90–100)</span>
        </button>
      </div>

      <!-- ABA 1: TABELA HISTÓRICA DE MEDIDAS REGISTRADAS -->
      @if (activeTab() === 'HISTORY') {
        <section class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <h3 class="section-title" style="margin-bottom: 0;">
              <span aria-hidden="true">📊</span>
              <span>Histórico Antropométrico, PA e Classificações OMS/MS</span>
            </h3>
            <button type="button" class="btn btn-diaper" style="min-height: 34px; font-size: 0.8rem;" (click)="activeTab.set('FORM')">
              ➕ Registrar Nova Medida
            </button>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                  <th style="padding: 0.5rem;">Data</th>
                  <th style="padding: 0.5rem;">Peso</th>
                  <th style="padding: 0.5rem;">Comp./Estatura</th>
                  <th style="padding: 0.5rem;">PC</th>
                  <th style="padding: 0.5rem;">IMC</th>
                  <th style="padding: 0.5rem;">PA (mmHg)</th>
                  <th style="padding: 0.5rem;">Classificação OMS/MS</th>
                  <th style="padding: 0.5rem; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (g of baby.growthLogs; track (g.id || g.measuredAt) + '-' + g.weightGrams) {
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 0.55rem 0.5rem; white-space: nowrap;">{{ g.measuredAt | date:'dd/MM/yyyy' }}</td>
                    <td style="padding: 0.55rem 0.5rem; font-weight: 700;">{{ g.weightGrams }} g</td>
                    <td style="padding: 0.55rem 0.5rem;">
                      <strong>{{ g.heightCm }} cm</strong>
                      @if (g.adjustedHeightCm && g.adjustedHeightCm !== g.heightCm) {
                        <span style="font-size: 0.72rem; color: var(--cat-milestone); display: block;">Ajust.: {{ g.adjustedHeightCm }} cm</span>
                      }
                    </td>
                    <td style="padding: 0.55rem 0.5rem;">{{ g.headCircumferenceCm }} cm</td>
                    <td style="padding: 0.55rem 0.5rem; font-weight: 700;">{{ g.bmi || calculateBmi(g.weightGrams, g.heightCm) }}</td>
                    <td style="padding: 0.55rem 0.5rem;">
                      @if (g.bloodPressureSystolic && g.bloodPressureDiastolic) {
                        <span class="badge">{{ g.bloodPressureSystolic }}/{{ g.bloodPressureDiastolic }}</span>
                      } @else {
                        <span style="color: var(--text-muted);">—</span>
                      }
                    </td>
                    <td style="padding: 0.55rem 0.5rem;">
                      <span class="badge" [class.badge-diaper]="g.zScoreWeightForAge >= -2 && g.zScoreWeightForAge <= 2" [class.badge-milestone]="g.zScoreWeightForAge < -2 || g.zScoreWeightForAge > 2">
                        Z={{ formatZScore(g.zScoreWeightForAge) }} • {{ g.classificationWeight || classifyZScore(g.zScoreWeightForAge) }}
                      </span>
                    </td>
                    <td style="padding: 0.55rem 0.5rem; text-align: right; white-space: nowrap;">
                      @if (g.id) {
                        <div style="display: inline-flex; gap: 0.3rem;">
                          <button type="button" class="btn" style="min-height: 28px; padding: 0.15rem 0.45rem; font-size: 0.72rem;" (click)="startEditGrowth(g)" title="Alterar">
                            ✏️
                          </button>
                          <button type="button" class="btn" style="min-height: 28px; padding: 0.15rem 0.45rem; font-size: 0.72rem; color: var(--cat-health);" (click)="deleteGrowth(g.id)" title="Excluir">
                            🗑️
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <details class="info-disclosure">
            <summary>💡 Interpretação das Curvas OMS e Prematuros (pág. 88 e 89)</summary>
            <div class="info-disclosure-body">
              <ul>
                <li><strong>Regra de 0,7 cm (pág. 88):</strong> Se &lt; 2 anos for medida em pé, somam-se +0,7 cm; se ≥ 2 anos for medida deitada, subtraem-se -0,7 cm.</li>
                <li><strong>Traçado da curva (pág. 89):</strong> Deve seguir paralelo à linha verde (escore-z 0). Desvios rápidos ou linha horizontal exigem investigação.</li>
                <li><strong>Prematuros (&lt; 37 sem.):</strong> Usar gráfico Intergrowth-21 (27–64 sem.) ou corrigir idade até os 2 anos (ou 3 anos se IG &lt; 28 sem.).</li>
              </ul>
              <app-official-reference page="p. 77, 88 e 89" />
            </div>
          </details>
        </section>
      }

      <!-- ABA 2: FORMULÁRIO DE REGISTRO / EDIÇÃO DE MEDIDA E PRESSÃO ARTERIAL -->
      @if (activeTab() === 'FORM') {
        <section class="card" style="border-top: 4px solid var(--cat-diaper);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <h3 class="section-title" style="margin-bottom: 0;">
              <span aria-hidden="true">📏</span>
              <span>{{ editingGrowthId() ? 'Alterar Medida Antropométrica / PA' : 'Registrar Nova Medida Antropométrica & PA' }}</span>
            </h3>
            @if (editingGrowthId()) {
              <button type="button" class="btn" style="min-height: 30px; font-size: 0.75rem;" (click)="cancelEdit()">
                ✕ Cancelar Edição
              </button>
            }
          </div>

          <div class="grid-2" style="margin-bottom: 0.85rem;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">Data da Aferição</label>
              <input type="date" class="input-field" [ngModel]="measuredAtDate()" (ngModelChange)="measuredAtDate.set($event)" />
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">Posição da Medida (Regra 0,7 cm)</label>
              <select class="input-field" [ngModel]="measuredPosition()" (ngModelChange)="measuredPosition.set($event)">
                <option value="Deitada (Comprimento)">Deitada (Comprimento — padrão &lt; 2 anos)</option>
                <option value="Em pé (Estatura)">Em pé (Estatura — padrão ≥ 2 anos)</option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">Peso (g)</label>
              <input type="number" class="input-field" [ngModel]="weightGrams()" (ngModelChange)="weightGrams.set(+$event)" min="400" max="80000" step="10" />
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">Comprimento / Estatura (cm)</label>
              <input type="number" class="input-field" [ngModel]="heightCm()" (ngModelChange)="heightCm.set(+$event)" min="25" max="165" step="0.1" />
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">Perímetro Cefálico — PC (cm)</label>
              <input type="number" class="input-field" [ngModel]="headCircumferenceCm()" (ngModelChange)="headCircumferenceCm.set(+$event)" min="20" max="65" step="0.1" />
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">PA Sistólica / Diastólica mmHg (pág. 77)</label>
              <div style="display: flex; gap: 0.35rem;">
                <input type="number" class="input-field" placeholder="Sist. (ex: 90)" [ngModel]="bloodPressureSystolic()" (ngModelChange)="bloodPressureSystolic.set($event ? +$event : undefined)" />
                <input type="number" class="input-field" placeholder="Diast. (ex: 60)" [ngModel]="bloodPressureDiastolic()" (ngModelChange)="bloodPressureDiastolic.set($event ? +$event : undefined)" />
              </div>
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">Semanas Pós-Concepcionais (RNPT 27–64 sem.)</label>
              <input type="number" class="input-field" placeholder="Opcional para prematuros" [ngModel]="correctedGestationalWeeks()" (ngModelChange)="correctedGestationalWeeks.set($event ? +$event : undefined)" />
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 700; display: block; margin-bottom: 0.2rem;">Observações Clínicas</label>
              <input type="text" class="input-field" placeholder="Manguito utilizado, observações..." [ngModel]="notesInput()" (ngModelChange)="notesInput.set($event)" />
            </div>
          </div>

          <div class="card-elevated" style="margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 700;">PRÉVIA DA CLASSIFICAÇÃO OMS/MS</div>
              <div style="font-size: 0.94rem; font-weight: 800; margin-top: 0.1rem;">
                Z = {{ formatZScore(effectiveZScore()) }} • {{ classifyZScore(effectiveZScore()) }} • IMC: {{ calculateBmi(weightGrams(), heightCm()) }} kg/m²
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label style="font-size: 0.76rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                <input type="checkbox" [ngModel]="useCustomZScore()" (ngModelChange)="useCustomZScore.set($event)" />
                <span>Escore-z manual</span>
              </label>
              @if (useCustomZScore()) {
                <input type="number" step="0.1" min="-4" max="4" class="input-field" style="width: 80px; min-height: 32px;" [ngModel]="customZScore()" (ngModelChange)="customZScore.set(+$event)" />
              }
            </div>
          </div>

          <button type="button" class="btn btn-diaper" style="width: 100%;" (click)="saveGrowthLog()">
            <span aria-hidden="true">💾</span>
            <span>{{ editingGrowthId() ? 'Salvar Alterações da Medida' : 'Salvar Medida no Histórico' }}</span>
          </button>
        </section>
      }

      <!-- ABA 3: GALERIA DOS 11 GRÁFICOS OFICIAIS DA CADERNETA (PÁG. 90 A 100) -->
      @if (activeTab() === 'CHARTS') {
        <section class="card">
          <h3 class="section-title">
            <span aria-hidden="true">📉</span>
            <span>Gráficos Oficiais de Crescimento da Caderneta (pág. 90 a 100)</span>
          </h3>

          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.85rem;">
            @for (chart of officialCharts; track chart.id) {
              <button
                type="button"
                class="btn"
                style="min-height: 32px; font-size: 0.75rem; padding: 0.2rem 0.6rem;"
                [class.btn-sleep]="selectedChartId() === chart.id"
                (click)="selectedChartId.set(chart.id)">
                {{ chart.label }}
              </button>
            }
          </div>

          @if (activeChart(); as chart) {
            <div class="card-elevated">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div>
                  <div style="font-weight: 800; font-size: 0.92rem;">{{ chart.title }}</div>
                  <div style="font-size: 0.76rem; color: var(--text-secondary);">Pontos de corte: {{ chart.cutoffs }}</div>
                </div>
                <span class="badge badge-sleep">Página {{ chart.page }}</span>
              </div>
              <img [src]="chart.image" [alt]="chart.title" style="width: 100%; max-height: 740px; object-fit: contain; border-radius: 8px; background: #fff;" loading="lazy" />
            </div>
          }
        </section>
      }
    }
  `
})
export class GrowthTrackerComponent implements OnInit {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  readonly activeTab = signal<'HISTORY' | 'FORM' | 'CHARTS'>('HISTORY');
  readonly editingGrowthId = signal<string | null>(null);
  readonly measuredAtDate = signal<string>(new Date().toISOString().slice(0, 10));
  readonly measuredPosition = signal<string>('Deitada (Comprimento)');
  readonly weightGrams = signal<number>(3200);
  readonly heightCm = signal<number>(49);
  readonly headCircumferenceCm = signal<number>(35);
  readonly bloodPressureSystolic = signal<number | undefined>(undefined);
  readonly bloodPressureDiastolic = signal<number | undefined>(undefined);
  readonly correctedGestationalWeeks = signal<number | undefined>(undefined);
  readonly notesInput = signal<string>('');
  readonly useCustomZScore = signal<boolean>(false);
  readonly customZScore = signal<number>(0);

  readonly selectedChartId = signal<string>('P92_PESO_0A2');

  readonly officialCharts = [
    { id: 'P90_PREMATURO', page: '90', label: 'Prematuro 27–64 sem', title: 'Gráficos de Crescimento para Criança Prematura — Intergrowth-21 (27 a 64 semanas)', cutoffs: 'PC, Peso e Comprimento para Idade Gestacional Corrigida', image: 'imagens/p092_pag090_grafico_pre_termo.jpg' },
    { id: 'P91_PC_0A2', page: '91', label: 'PC 0–2a', title: 'Perímetro Cefálico para a Idade — 0 a 2 anos (OMS)', cutoffs: '< -2Z Acima/abaixo do esperado; Entre -2Z e +2Z Adequado', image: 'imagens/p093_pag091_grafico_perimetro_cefalico_0a2_anos.jpg' },
    { id: 'P92_PESO_0A2', page: '92', label: 'Peso 0–2a', title: 'Peso para a Idade — 0 a 2 anos (OMS)', cutoffs: '< -3Z Muito baixo; -3Z a -2Z Baixo; -2Z a +2Z Adequado; > +2Z Elevado', image: 'imagens/p094_pag092_grafico_peso_idade_0a2_anos.jpg' },
    { id: 'P93_COMP_0A2', page: '93', label: 'Comp. 0–2a', title: 'Comprimento para a Idade — 0 a 2 anos (OMS)', cutoffs: '< -3Z Muito baixo; -3Z a -2Z Baixo; ≥ -2Z Adequado', image: 'imagens/p095_pag093_grafico_comprimento_idade_0a2_anos.jpg' },
    { id: 'P94_IMC_0A2', page: '94', label: 'IMC 0–2a', title: 'Índice de Massa Corporal (IMC) para a Idade — 0 a 2 anos (OMS)', cutoffs: '< -3Z Magreza acentuada; -3Z a -2Z Magreza; -2Z a +1Z Eutrofia; +1Z a +2Z Risco de sobrepeso; +2Z a +3Z Sobrepeso; > +3Z Obesidade', image: 'imagens/p096_pag094_grafico_imc_idade_0a2_anos.jpg' },
    { id: 'P95_PESO_2A5', page: '95', label: 'Peso 2–5a', title: 'Peso para a Idade — 2 a 5 anos (OMS)', cutoffs: '< -3Z Muito baixo; -3Z a -2Z Baixo; -2Z a +2Z Adequado; > +2Z Elevado', image: 'imagens/p097_pag095_grafico_peso_idade_2a5_anos.jpg' },
    { id: 'P96_EST_2A5', page: '96', label: 'Estatura 2–5a', title: 'Estatura para a Idade — 2 a 5 anos (OMS)', cutoffs: '< -3Z Muito baixa; -3Z a -2Z Baixa; ≥ -2Z Adequada', image: 'imagens/p098_pag096_grafico_estatura_idade_2a5_anos.jpg' },
    { id: 'P97_IMC_2A5', page: '97', label: 'IMC 2–5a', title: 'IMC para a Idade — 2 a 5 anos (OMS)', cutoffs: '< -3Z Magreza acentuada; -3Z a -2Z Magreza; -2Z a +1Z Eutrofia; +1Z a +2Z Risco de sobrepeso; +2Z a +3Z Sobrepeso; > +3Z Obesidade', image: 'imagens/p099_pag097_grafico_imc_idade_2a5_anos.jpg' },
    { id: 'P98_PESO_5A10', page: '98', label: 'Peso 5–10a', title: 'Peso para a Idade — 5 a 10 anos (OMS)', cutoffs: '< -3Z Muito baixo; -3Z a -2Z Baixo; -2Z a +2Z Adequado; > +2Z Elevado', image: 'imagens/p100_pag098_grafico_peso_idade_5a10_anos.jpg' },
    { id: 'P99_EST_5A10', page: '99', label: 'Estatura 5–10a', title: 'Estatura para a Idade — 5 a 10 anos (OMS)', cutoffs: '< -3Z Muito baixa; -3Z a -2Z Baixa; ≥ -2Z Adequada', image: 'imagens/p101_pag099_grafico_estatura_idade_5a10_anos.jpg' },
    { id: 'P100_IMC_5A10', page: '100', label: 'IMC 5–10a', title: 'IMC para a Idade — 5 a 10 anos (OMS)', cutoffs: '< -3Z Magreza acentuada; -3Z a -2Z Magreza; -2Z a +1Z Eutrofia; +1Z a +2Z Sobrepeso; +2Z a +3Z Obesidade; > +3Z Obesidade grave', image: 'imagens/p102_pag100_grafico_imc_idade_5a10_anos.jpg' }
  ];

  readonly activeChart = computed(() =>
    this.officialCharts.find(c => c.id === this.selectedChartId()) || this.officialCharts[2]
  );

  constructor() {
    effect(() => {
      const b = this.babyStore.activeBaby();
      if (b && b.id && !this.editingGrowthId()) {
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
    if (z < -3) return 'Peso muito baixo';
    if (z < -2) return 'Peso baixo';
    if (z > 2) return 'Peso elevado';
    return 'Peso adequado';
  }

  calculateBmi(weightGrams: number, heightCm: number): string {
    if (!weightGrams || !heightCm || heightCm <= 0) return '-';
    const weightKg = weightGrams / 1000;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  }

  startEditGrowth(g: GrowthLog): void {
    if (!g.id) return;
    this.editingGrowthId.set(g.id);
    this.measuredAtDate.set(g.measuredAt.slice(0, 10));
    this.measuredPosition.set(g.measuredPosition || 'Deitada (Comprimento)');
    this.weightGrams.set(g.weightGrams);
    this.heightCm.set(g.heightCm);
    this.headCircumferenceCm.set(g.headCircumferenceCm);
    this.bloodPressureSystolic.set(g.bloodPressureSystolic);
    this.bloodPressureDiastolic.set(g.bloodPressureDiastolic);
    this.correctedGestationalWeeks.set(g.correctedGestationalWeeks);
    this.notesInput.set(g.notes || '');
    this.activeTab.set('FORM');
  }

  cancelEdit(): void {
    this.editingGrowthId.set(null);
    this.notesInput.set('');
    this.activeTab.set('HISTORY');
  }

  async deleteGrowth(id: string): Promise<void> {
    await this.routineStore.deleteGrowthMeasurement(id);
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
    const payload = {
      measuredAt: measuredAtIso,
      weightGrams: this.weightGrams(),
      heightCm: this.heightCm(),
      measuredPosition: this.measuredPosition(),
      headCircumferenceCm: this.headCircumferenceCm(),
      zScoreWeightForAge: this.effectiveZScore(),
      bloodPressureSystolic: this.bloodPressureSystolic(),
      bloodPressureDiastolic: this.bloodPressureDiastolic(),
      correctedGestationalWeeks: this.correctedGestationalWeeks(),
      notes: this.notesInput()
    };

    const editId = this.editingGrowthId();
    if (editId) {
      await this.routineStore.updateGrowthMeasurement(editId, payload);
      this.editingGrowthId.set(null);
    } else {
      await this.routineStore.logGrowthMeasurement(payload);
    }
    this.activeTab.set('HISTORY');
  }
}
