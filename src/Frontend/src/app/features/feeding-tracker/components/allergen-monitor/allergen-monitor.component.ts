import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutineStore } from '../../../../core/state/routine.store';
import { PopupAlertService } from '../../../../core/services/popup-alert.service';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-allergen-monitor',
  standalone: true,
  imports: [FormsModule, OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-milestone);">
      <h3 class="section-title">
        <span aria-hidden="true">🥜</span>
        <span>Monitoramento de Novos Alimentos (72h)</span>
      </h3>

      <!-- Iniciar acompanhamento de novo alimento -->
      <div class="card-elevated" style="margin-bottom: 0.85rem;">
        <div style="font-weight: 700; font-size: 0.84rem; margin-bottom: 0.45rem;">➕ Iniciar Observação de Novo Alimento</div>
        <div class="grid-3">
          <select class="input-field" [(ngModel)]="newAllergenName">
            <option value="Ovos de galinha (Grupo das carnes e ovos)">Ovos de galinha</option>
            <option value="Pescados / Peixe (Grupo das carnes e ovos)">Pescados / Peixe</option>
            <option value="Amendoim, castanhas e nozes (Grupo pág. 32)">Amendoim, castanhas e nozes</option>
            <option value="Trigo / Aveia (Grupo dos cereais)">Trigo / Aveia</option>
            <option value="Coalhadas, iogurtes naturais sem açúcar e queijos">Iogurte natural / Queijos</option>
          </select>
          <input type="text" class="input-field" [(ngModel)]="initialDose" placeholder="Quantidade (ex: 2 colheres)" />
          <button type="button" class="btn btn-milestone" (click)="startTrial()">
            <span aria-hidden="true">⏱️</span>
            <span>Iniciar Observação</span>
          </button>
        </div>
      </div>

      <!-- Lista de Alimentos Acompanhados -->
      @for (item of store.allergenTrials(); track item.trial.id) {
        <div class="card-elevated" style="margin-bottom: 0.65rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="font-weight: 800; font-size: 0.95rem;">{{ item.trial.foodName }}</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">{{ item.evaluation.clinicalGuidance }}</div>
            </div>
            <span class="badge" [class]="item.evaluation.hasAlertSymptoms ? 'badge-health' : item.trial.status === 'SafeCompleted' ? 'badge-diaper' : 'badge-milestone'">
              @if (item.evaluation.hasAlertSymptoms) {
                <span aria-hidden="true">🚨</span> Alerta Registrado
              } @else if (item.trial.status === 'SafeCompleted') {
                <span aria-hidden="true">✅</span> Seguro / Concluído
              } @else {
                <span aria-hidden="true">⏳</span> {{ item.evaluation.remainingHours }}h restantes
              }
            </span>
          </div>

          @if (item.trial.status === 'MonitoringActive') {
            <div style="margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid var(--border-subtle); display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <button type="button" class="btn" style="min-height: 30px; font-size: 0.75rem;" (click)="reportSymptom(item.trial.id, 'hives')">
                🔴 Manchas na pele
              </button>
              <button type="button" class="btn" style="min-height: 30px; font-size: 0.75rem;" (click)="reportSymptom(item.trial.id, 'swelling')">
                🚨 Dificuldade respiratória / inchaço
              </button>
              <button type="button" class="btn" style="min-height: 30px; font-size: 0.75rem;" (click)="reportSymptom(item.trial.id, 'vomiting')">
                ⚠️ Vômitos / Diarreia
              </button>
            </div>
          }
        </div>
      }

      <details class="info-disclosure">
        <summary>💡 Orientações sobre Novos Alimentos e Sinais de Perigo (pág. 23, 32 e 33)</summary>
        <div class="info-disclosure-body">
          <p>
            Quando a criança recusar determinado alimento, ofereça-o novamente em outras refeições (são necessárias de 8 a 10 tentativas em média para aceitação). Em caso de manchas avermelhadas, vômitos persistentes ou dificuldade para respirar, procure urgência (SAMU 192).
          </p>
          <app-official-reference page="p. 23, 32 e 33" />
        </div>
      </details>
    </div>
  `
})
export class AllergenMonitorComponent {
  readonly store = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);
  newAllergenName = 'Ovos de galinha (Grupo das carnes e ovos)';
  initialDose = '';

  async startTrial(): Promise<void> {
    if (!this.newAllergenName.trim() || !this.initialDose.trim()) {
      this.popupAlert.incompleteForm(
        'Informe o alimento e a quantidade inicial ofertada para iniciar o acompanhamento.'
      );
      return;
    }

    await this.store.startAllergenTrial({
      foodName: this.newAllergenName,
      foodCategory: 'Quadro 2 — Grupos de Alimentos (Caderneta da Criança, pág. 32)',
      initialQuantityOffered: this.initialDose.trim()
    });
    this.initialDose = '';
  }

  async reportSymptom(trialId: string, type: 'hives' | 'swelling' | 'vomiting'): Promise<void> {
    await this.store.updateAllergenSymptoms(trialId, {
      hivesOrRash: type === 'hives',
      facialSwelling: type === 'swelling',
      acuteVomiting: type === 'vomiting',
      explosiveDiarrhea: type === 'vomiting',
      wheezing: type === 'swelling'
    });
  }
}
