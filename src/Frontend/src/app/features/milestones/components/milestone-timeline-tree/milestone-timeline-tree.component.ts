import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BabyStore, DevelopmentSurveillanceRecord } from '../../../../core/state/baby.store';
import { RoutineStore, MilestoneItem } from '../../../../core/state/routine.store';
import { BabyAgePipe } from '../../../../shared/pipes/baby-age.pipe';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-milestone-timeline-tree',
  standalone: true,
  imports: [FormsModule, BabyAgePipe, OfficialReferenceComponent],
  template: `
    @if (babyStore.activeBaby(); as baby) {
      <!-- Cabeçalho Enxuto com Status Atual do Desenvolvimento -->
      <div class="card" style="border-left: 5px solid var(--cat-milestone); padding: 0.85rem 1rem; margin-bottom: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">
              Vigilância do Desenvolvimento Infantil • {{ baby | babyAge }}
            </div>
            <div style="font-size: 1.05rem; font-weight: 800; margin-top: 0.1rem;">
              {{ baby.developmentSurveillance?.overallClassification || 'Desenvolvimento adequado' }}
            </div>
          </div>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <span class="badge badge-diaper">P = Presente</span>
            <span class="badge badge-health">A = Ausente</span>
            <span class="badge badge-milestone">NV = Não Verificado</span>
          </div>
        </div>
      </div>

      <!-- Barra Segmentada das 4 Áreas de Desenvolvimento -->
      <div class="segmented-bar" role="tablist" aria-label="Áreas de Vigilância do Desenvolvimento">
        <button type="button" class="segmented-btn" [class.active]="activeSection() === 'MARCOS'" (click)="activeSection.set('MARCOS')">
          <span>📋</span>
          <span>Marcos por Idade</span>
        </button>
        <button type="button" class="segmented-btn" [class.active]="activeSection() === 'RISCO_FENOTIPO'" (click)="activeSection.set('RISCO_FENOTIPO')">
          <span>⚠️</span>
          <span>Fatores de Risco &amp; 6–10a</span>
        </button>
        <button type="button" class="segmented-btn" [class.active]="activeSection() === 'MCHAT'" (click)="activeSection.set('MCHAT')">
          <span>🧩</span>
          <span>Triagem M-CHAT-R/F™</span>
        </button>
        <button type="button" class="segmented-btn" [class.active]="activeSection() === 'QUADROS_OFICIAIS'" (click)="activeSection.set('QUADROS_OFICIAIS')">
          <span>🖼️</span>
          <span>Quadros Oficiais</span>
        </button>
      </div>

      <!-- SEÇÃO 1: MARCOS DO DESENVOLVIMENTO FILTRADOS POR FAIXA ETÁRIA -->
      @if (activeSection() === 'MARCOS') {
        <div class="card">
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.85rem;">
            <button type="button" class="btn" style="min-height: 32px; font-size: 0.76rem;" [class.btn-sleep]="ageGroupFilter() === '0_A_6_MESES'" (click)="ageGroupFilter.set('0_A_6_MESES')">
              0 a 6 meses (1–12)
            </button>
            <button type="button" class="btn" style="min-height: 32px; font-size: 0.76rem;" [class.btn-sleep]="ageGroupFilter() === '6_A_18_MESES'" (click)="ageGroupFilter.set('6_A_18_MESES')">
              6 a 18 meses (13–24)
            </button>
            <button type="button" class="btn" style="min-height: 32px; font-size: 0.76rem;" [class.btn-sleep]="ageGroupFilter() === '18_A_42_MESES'" (click)="ageGroupFilter.set('18_A_42_MESES')">
              18 a 42 meses (25–36)
            </button>
            <button type="button" class="btn" style="min-height: 32px; font-size: 0.76rem;" [class.btn-sleep]="ageGroupFilter() === '42_A_60_MESES'" (click)="ageGroupFilter.set('42_A_60_MESES')">
              42 a 60 meses (37–44)
            </button>
            <button type="button" class="btn" style="min-height: 32px; font-size: 0.76rem;" [class.btn-sleep]="ageGroupFilter() === '60_A_72_MESES'" (click)="ageGroupFilter.set('60_A_72_MESES')">
              60 a 72 meses (45–52)
            </button>
            <button type="button" class="btn" style="min-height: 32px; font-size: 0.76rem;" [class.btn-sleep]="ageGroupFilter() === 'ALL'" (click)="ageGroupFilter.set('ALL')">
              Todos ({{ routineStore.milestones().length }})
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.55rem;">
            @for (m of filteredMilestones(); track m.milestoneCode) {
              <div class="card-elevated" style="display: flex; justify-content: space-between; align-items: center; gap: 0.85rem; flex-wrap: wrap; padding: 0.7rem 0.9rem;">
                <div style="flex: 1; min-width: 240px;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    @if (m.cadernetaNumber) {
                      <span class="badge badge-sleep" style="padding: 0.1rem 0.45rem; font-size: 0.7rem;">#{{ m.cadernetaNumber }}</span>
                    }
                    <span class="badge badge-milestone" style="padding: 0.1rem 0.45rem; font-size: 0.7rem;">{{ m.ageRangeLabel }}</span>
                    <strong style="font-size: 0.92rem;">{{ m.title }}</strong>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                    {{ m.howToInvestigate || m.description }}
                  </div>
                </div>

                <div style="display: flex; gap: 0.3rem; flex-shrink: 0;">
                  <button
                    type="button"
                    class="btn"
                    style="min-height: 32px; font-size: 0.76rem; padding: 0.2rem 0.6rem;"
                    [class.btn-diaper]="m.status === 'Achieved' || m.officialCode === 'P'"
                    (click)="routineStore.updateMilestoneStatus(m.milestoneCode, 'Achieved', 'Marco presente (P)', 'P')">
                    ✅ P
                  </button>

                  <button
                    type="button"
                    class="btn"
                    style="min-height: 32px; font-size: 0.76rem; padding: 0.2rem 0.6rem;"
                    [class.btn-health]="m.officialCode === 'A'"
                    (click)="routineStore.updateMilestoneStatus(m.milestoneCode, 'NotStarted', 'Marco ausente (A)', 'A')">
                    ⚠️ A
                  </button>

                  <button
                    type="button"
                    class="btn"
                    style="min-height: 32px; font-size: 0.76rem; padding: 0.2rem 0.6rem;"
                    [class.btn-milestone]="m.status === 'InProgress' && m.officialCode !== 'A'"
                    (click)="routineStore.updateMilestoneStatus(m.milestoneCode, 'InProgress', 'Marco não verificado (NV)', 'NV')">
                    ⏳ NV
                  </button>
                </div>
              </div>
            }
          </div>

          <details class="info-disclosure">
            <summary>💡 Critérios de Tomada de Decisão do Desenvolvimento (pág. 79 e 80)</summary>
            <div class="info-disclosure-body">
              <ul>
                <li><strong>Desenvolvimento adequado:</strong> Todos os marcos presentes para a faixa etária — elogiar a família e seguir acompanhamento.</li>
                <li><strong>Alerta para o desenvolvimento:</strong> Ausência de 1+ marcos na faixa atual ou fator de risco — orientar estímulo com afeto e reavaliar em 30 dias.</li>
                <li><strong>Provável atraso:</strong> PC &lt;-2Z ou &gt;+2Z, 3+ alterações fenotípicas ou ausência de marco de faixa etária anterior — encaminhar à rede especializada.</li>
              </ul>
              <app-official-reference page="p. 78 a 85" />
            </div>
          </details>
        </div>
      }

      <!-- SEÇÃO 2: FATORES DE RISCO, ALTERAÇÕES FENOTÍPICAS E 6 A 10 ANOS -->
      @if (activeSection() === 'RISCO_FENOTIPO') {
        @if (baby.developmentSurveillance; as surv) {
          <div class="card">
            <div class="grid-2" style="margin-bottom: 0.85rem;">
              <div class="card-elevated">
                <h4 style="font-size: 0.9rem; font-weight: 800; margin-bottom: 0.45rem;">
                  ⚠️ Fatores de Risco (pág. 78)
                </h4>
                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                  @for (rf of surv.riskFactors; track rf.code) {
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; cursor: pointer;">
                      <input type="checkbox" [(ngModel)]="rf.present" />
                      <span>{{ rf.label }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="card-elevated">
                <h4 style="font-size: 0.9rem; font-weight: 800; margin-bottom: 0.45rem;">
                  🧬 Alterações Fenotípicas (pág. 78 e 80)
                </h4>
                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                  @for (ph of surv.phenotypicAlterations; track ph.code) {
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; cursor: pointer;">
                      <input type="checkbox" [(ngModel)]="ph.present" />
                      <span>{{ ph.label }}</span>
                    </label>
                  }
                </div>
              </div>
            </div>

            <div class="card-elevated" style="margin-bottom: 0.85rem;">
              <h4 style="font-size: 0.9rem; font-weight: 800; margin-bottom: 0.4rem;">
                🎒 Desenvolvimento Escolar e Social — 6 a 10 Anos (pág. 86)
              </h4>
              <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                <input type="text" class="input-field" style="max-width: 160px;" [(ngModel)]="newNoteAgeBand" placeholder="Faixa (6–7 anos)" />
                <input type="text" class="input-field" style="flex: 1;" [(ngModel)]="newNoteObservation" placeholder="Aprendizagem, leitura/escrita, socialização..." />
                <button type="button" class="btn btn-sleep" (click)="addNote6To10(surv)">➕ Adicionar</button>
              </div>
              @for (n of surv.notes6To10Years; track n.ageBand + '-' + n.observations) {
                <div style="font-size: 0.8rem; padding: 0.3rem 0; border-bottom: 1px solid var(--border-subtle);">
                  <strong>{{ n.ageBand }}:</strong> {{ n.observations }}
                </div>
              }
            </div>

            <button type="button" class="btn btn-diaper" (click)="saveSurveillance(surv)">
              💾 Salvar Avaliação de Risco e Fenótipo
            </button>
          </div>
        }
      }

      <!-- SEÇÃO 3: CHECKLIST M-CHAT-R/F™ COMPLETO (20 QUESTÕES — PÁG. 87) -->
      @if (activeSection() === 'MCHAT') {
        @if (baby.developmentSurveillance; as surv) {
          <div class="card">
            <div class="card-elevated" style="margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <h4 style="font-size: 0.94rem; font-weight: 800;">
                  🧩 M-CHAT-R/F™ — Triagem de Autismo (16 a 30 meses — pág. 87)
                </h4>
                <div style="font-size: 0.76rem; color: var(--text-secondary);">
                  Nas questões 2, 5 e 12, "SIM" indica risco; nas demais, "NÃO" indica risco.
                </div>
              </div>
              <span class="badge" [class]="mchatRiskCount() <= 2 ? 'badge-diaper' : (mchatRiskCount() <= 7 ? 'badge-milestone' : 'badge-health')">
                Escore: {{ mchatRiskCount() }}/20 • {{ mchatRiskClassification() }}
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.85rem;">
              @for (q of surv.mChatRQuestions; track q.number) {
                <div class="card-elevated" style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding: 0.65rem 0.85rem;">
                  <div style="flex: 1; min-width: 240px;">
                    <div style="font-size: 0.83rem; font-weight: 700;">
                      {{ q.number }}. {{ q.questionText }}
                    </div>
                    @if (q.exampleText) {
                      <div style="font-size: 0.74rem; color: var(--text-secondary);">{{ q.exampleText }}</div>
                    }
                  </div>
                  <div style="display: flex; gap: 0.35rem;">
                    <button
                      type="button"
                      class="btn"
                      style="min-height: 30px; font-size: 0.75rem; padding: 0.15rem 0.65rem;"
                      [class.btn-diaper]="q.answer === 'Sim' && !q.reverseScored"
                      [class.btn-health]="q.answer === 'Sim' && q.reverseScored"
                      (click)="q.answer = 'Sim'">
                      SIM
                    </button>
                    <button
                      type="button"
                      class="btn"
                      style="min-height: 30px; font-size: 0.75rem; padding: 0.15rem 0.65rem;"
                      [class.btn-diaper]="q.answer === 'Não' && q.reverseScored"
                      [class.btn-health]="q.answer === 'Não' && !q.reverseScored"
                      (click)="q.answer = 'Não'">
                      NÃO
                    </button>
                  </div>
                </div>
              }
            </div>

            <button type="button" class="btn btn-diaper" (click)="saveSurveillance(surv)">
              💾 Salvar Resultado M-CHAT-R/F™
            </button>
          </div>
        }
      }

      <!-- SEÇÃO 4: QUADROS ILUSTRADOS OFICIAIS (PÁG. 80 A 85) -->
      @if (activeSection() === 'QUADROS_OFICIAIS') {
        <div class="card">
          <div class="grid-2" style="gap: 0.8rem;">
            <div class="card-elevated">
              <div style="font-weight: 800; font-size: 0.82rem; margin-bottom: 0.35rem;">Instrumento de Avaliação Integral (pág. 80)</div>
              <img src="imagens/p082_pag080_instrumento_avaliacao_desenvolvimento.jpg" alt="Instrumento pág. 80" style="width: 100%; border-radius: 8px;" loading="lazy" />
            </div>
            <div class="card-elevated">
              <div style="font-weight: 800; font-size: 0.82rem; margin-bottom: 0.35rem;">Marcos 1 a 12 — 0 a 6 meses (pág. 81)</div>
              <img src="imagens/p083_pag081_marcos_0a6meses.jpg" alt="Marcos 0 a 6 meses pág. 81" style="width: 100%; border-radius: 8px;" loading="lazy" />
            </div>
            <div class="card-elevated">
              <div style="font-weight: 800; font-size: 0.82rem; margin-bottom: 0.35rem;">Marcos 13 a 24 — 6 a 18 meses (pág. 82)</div>
              <img src="imagens/p084_pag082_marcos_6a18meses.jpg" alt="Marcos 6 a 18 meses pág. 82" style="width: 100%; border-radius: 8px;" loading="lazy" />
            </div>
            <div class="card-elevated">
              <div style="font-weight: 800; font-size: 0.82rem; margin-bottom: 0.35rem;">Marcos 25 a 36 — 18 a 42 meses (pág. 83)</div>
              <img src="imagens/p085_pag083_marcos_18a42meses.jpg" alt="Marcos 18 a 42 meses pág. 83" style="width: 100%; border-radius: 8px;" loading="lazy" />
            </div>
            <div class="card-elevated">
              <div style="font-weight: 800; font-size: 0.82rem; margin-bottom: 0.35rem;">Marcos 37 a 44 — 42 a 60 meses (pág. 84)</div>
              <img src="imagens/p086_pag084_marcos_42a60meses.jpg" alt="Marcos 42 a 60 meses pág. 84" style="width: 100%; border-radius: 8px;" loading="lazy" />
            </div>
            <div class="card-elevated">
              <div style="font-weight: 800; font-size: 0.82rem; margin-bottom: 0.35rem;">Marcos 45 a 52 — 60 a 72 meses (pág. 85)</div>
              <img src="imagens/p087_pag085_marcos_60a72meses.jpg" alt="Marcos 60 a 72 meses pág. 85" style="width: 100%; border-radius: 8px;" loading="lazy" />
            </div>
          </div>
        </div>
      }
    }
  `
})
export class MilestoneTimelineTreeComponent {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);

  readonly activeSection = signal<'MARCOS' | 'RISCO_FENOTIPO' | 'MCHAT' | 'QUADROS_OFICIAIS'>('MARCOS');
  readonly ageGroupFilter = signal<'ALL' | '0_A_6_MESES' | '6_A_18_MESES' | '18_A_42_MESES' | '42_A_60_MESES' | '60_A_72_MESES'>('0_A_6_MESES');

  newNoteAgeBand = '6 a 8 anos';
  newNoteObservation = '';

  readonly filteredMilestones = computed<MilestoneItem[]>(() => {
    const all = this.routineStore.milestones();
    const filter = this.ageGroupFilter();
    if (filter === 'ALL') return all;
    if (filter === '0_A_6_MESES') return all.filter(m => (m.cadernetaNumber && m.cadernetaNumber >= 1 && m.cadernetaNumber <= 12) || (!m.cadernetaNumber && (m.expectedAgeMonths ?? 0) <= 6));
    if (filter === '6_A_18_MESES') return all.filter(m => (m.cadernetaNumber && m.cadernetaNumber >= 13 && m.cadernetaNumber <= 24) || (!m.cadernetaNumber && (m.expectedAgeMonths ?? 0) > 6 && (m.expectedAgeMonths ?? 0) <= 18));
    if (filter === '18_A_42_MESES') return all.filter(m => (m.cadernetaNumber && m.cadernetaNumber >= 25 && m.cadernetaNumber <= 36) || (!m.cadernetaNumber && (m.expectedAgeMonths ?? 0) > 18 && (m.expectedAgeMonths ?? 0) <= 42));
    if (filter === '42_A_60_MESES') return all.filter(m => m.cadernetaNumber && m.cadernetaNumber >= 37 && m.cadernetaNumber <= 44);
    if (filter === '60_A_72_MESES') return all.filter(m => m.cadernetaNumber && m.cadernetaNumber >= 45 && m.cadernetaNumber <= 52);
    return all;
  });

  mchatRiskCount(): number {
    const questions = this.babyStore.activeBaby().developmentSurveillance?.mChatRQuestions || [];
    let score = 0;
    for (const q of questions) {
      if (!q.answer) continue;
      if ((q.reverseScored && q.answer === 'Sim') || (!q.reverseScored && q.answer === 'Não')) {
        score++;
      }
    }
    return score;
  }

  mchatRiskClassification(): string {
    const score = this.mchatRiskCount();
    if (score <= 2) return 'Baixo Risco (0–2)';
    if (score <= 7) return 'Risco Moderado (3–7)';
    return 'Alto Risco (8–20)';
  }

  addNote6To10(surv: DevelopmentSurveillanceRecord): void {
    if (!this.newNoteObservation.trim()) return;
    surv.notes6To10Years = [
      ...(surv.notes6To10Years || []),
      {
        ageBand: this.newNoteAgeBand || '6 a 10 anos',
        observations: this.newNoteObservation.trim(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.newNoteObservation = '';
  }

  async saveSurveillance(surv: DevelopmentSurveillanceRecord): Promise<void> {
    await this.routineStore.updateDevelopmentSurveillance(surv);
  }
}
