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
        <span>Acompanhamento de Novos Alimentos, Aceitação e Sinais de Perigo (pág. 23, 32 e 33)</span>
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Aos 6 meses a criança já pode receber outros alimentos além do leite materno (Quadro 2 — Grupos de alimentos: feijões, cereais, raízes e tubérculos, legumes e verduras, frutas, carnes e ovos, leites e queijos, amendoim, castanhas e nozes). Quando sua filha recusar determinado alimento, ofereça-o novamente em outras refeições (algumas vezes, são necessárias de oito a dez tentativas para que a criança aceite o novo alimento). Anote as dificuldades com a alimentação para conversar na consulta ou nas sessões de grupos do serviço de saúde.
      </p>

      <!-- Iniciar acompanhamento de novo alimento -->
      <div class="card-elevated" style="margin-bottom: 1rem;">
        <div style="font-weight: 700; font-size: 0.88rem; margin-bottom: 0.5rem;">➕ Registrar Introdução e Observação de Alimento (Quadro 2 — pág. 32)</div>
        <div class="grid-3">
          <select class="input-field" [(ngModel)]="newAllergenName">
            <option value="Ovos de galinha (Grupo das carnes e ovos)">Ovos de galinha (Grupo das carnes e ovos)</option>
            <option value="Pescados / Peixe (Grupo das carnes e ovos)">Pescados / Peixe (Grupo das carnes e ovos)</option>
            <option value="Amendoim, castanhas e nozes (Grupo pág. 32)">Amendoim, castanhas e nozes (Grupo pág. 32)</option>
            <option value="Trigo / Aveia (Grupo dos cereais)">Trigo / Aveia (Grupo dos cereais)</option>
            <option value="Coalhadas, iogurtes naturais sem açúcar e queijos">Coalhadas, iogurtes naturais sem açúcar e queijos</option>
          </select>
          <input type="text" class="input-field" [(ngModel)]="initialDose" placeholder="Quantidade oferecida (ex: 2 a 3 colheres de sopa)" />
          <button type="button" class="btn btn-milestone" (click)="startTrial()">
            <span aria-hidden="true">⏱️</span>
            <span>Iniciar Observação</span>
          </button>
        </div>
      </div>

      <!-- Lista de Alimentos Acompanhados -->
      @for (item of store.allergenTrials(); track item.trial.id) {
        <div class="card-elevated" style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="font-weight: 800; font-size: 1rem;">{{ item.trial.foodName }}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">{{ item.evaluation.clinicalGuidance }}</div>
            </div>
            <span class="badge" [class]="item.evaluation.hasAlertSymptoms ? 'badge-health' : item.trial.status === 'SafeCompleted' ? 'badge-diaper' : 'badge-milestone'">
              @if (item.evaluation.hasAlertSymptoms) {
                <span aria-hidden="true">🚨</span> Sinal de Alerta / Perigo Registrado
              } @else if (item.trial.status === 'SafeCompleted') {
                <span aria-hidden="true">✅</span> Alimento Aceito sem Intercorrências
              } @else {
                <span aria-hidden="true">⏳</span> {{ item.evaluation.remainingHours }}h em observação
              }
            </span>
          </div>

          <!-- Checklist de Sinais de Perigo / Alerta da Caderneta (pág. 23 e 71–76) -->
          @if (item.trial.status === 'MonitoringActive') {
            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); font-size: 0.84rem;">
              <div style="font-weight: 700; margin-bottom: 0.4rem;">Registrar Sinais de Perigo ou Alerta (Caderneta da Criança, pág. 23 e 74 — Ligue 192 SAMU em urgência):</div>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <button type="button" class="btn" style="min-height: 34px; font-size: 0.8rem;" (click)="reportSymptom(item.trial.id, 'hives')">
                  🔴 Criança com manchas avermelhadas ou arroxeadas na pele (pág. 23)
                </button>
                <button type="button" class="btn" style="min-height: 34px; font-size: 0.8rem;" (click)="reportSymptom(item.trial.id, 'swelling')">
                  🚨 Dificuldade para respirar, respiração rápida ou sibilâncias (pág. 23 e 74)
                </button>
                <button type="button" class="btn" style="min-height: 34px; font-size: 0.8rem;" (click)="reportSymptom(item.trial.id, 'vomiting')">
                  ⚠️ Criança que vomita tudo o que come e bebe / Diarreia (pág. 23 e 74)
                </button>
              </div>
            </div>
          }
        </div>
      }

      <app-official-reference page="Caderneta da Criança, p. 23: sinais de perigo; p. 32: Quadro 2 – Grupos de alimentos; p. 33: aceitação e dificuldades com a alimentação" />
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
