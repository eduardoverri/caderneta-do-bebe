import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BabyStore } from '../../../../core/state/baby.store';
import { RoutineStore } from '../../../../core/state/routine.store';
import { PopupAlertService } from '../../../../core/services/popup-alert.service';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-dose-calculator',
  standalone: true,
  imports: [FormsModule, OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-health);">
      <h3 class="section-title">
        <span aria-hidden="true">💊</span>
        <span>Administração Segura de Medicamentos Prescritos e Prevenção de Intoxicações (pág. 61 e 64)</span>
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Peso Atual Cadastrado: <strong>{{ weightKg() }} kg</strong> ({{ babyStore.activeBaby().currentWeightGrams }}g) •
        <strong>ATENÇÃO (pág. 61):</strong> Nunca dê à criança remédio que não tenha sido receitado pelo médico. Verifique sempre a validade do que você oferece a sua filha. Mantenha medicamentos fora do alcance da criança (pág. 63).
      </p>

      <div class="grid-2" style="margin-bottom: 1rem;">
        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Medicamento Receitado pelo Médico</label>
          <select class="input-field" [ngModel]="medicationName()" (ngModelChange)="medicationName.set($event)">
            <option value="Paracetamol Gotas (200mg/mL)">Paracetamol Gotas (200mg/mL) — Int. mín: 6h</option>
            <option value="Dipirona Gotas (500mg/mL)">Dipirona Sódica (500mg/mL) — Int. mín: 6h</option>
            <option value="Ibuprofeno Infantil (100mg/mL)">Ibuprofeno (100mg/mL) — Int. mín: 8h</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Temperatura Aferida (°C) — Febre ≥ 37,5 °C / Hipotermia ≤ 35,5 °C (pág. 23)</label>
          <input type="number" step="0.1" class="input-field" [(ngModel)]="temperature" />
        </div>

        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">
            Dose Prescrita (mg) — Limite máx seguro por peso: {{ maxSafeMg() }} mg
          </label>
          <input type="number" class="input-field" [ngModel]="doseMg()" (ngModelChange)="doseMg.set(+$event)" />
        </div>

        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Indicação Médica / Sintoma Observado</label>
          <input type="text" class="input-field" [(ngModel)]="reason" />
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button type="button" class="btn btn-health" style="flex: 1;" (click)="submitDose()">
          <span aria-hidden="true">🛡️</span>
          <span>Validar Segurança e Registrar Dose Prescrita</span>
        </button>

        <button type="button" class="btn" (click)="simulateOverdoseTest()" title="Simula tentativa de superdosagem para testar bloqueio de segurança">
          <span aria-hidden="true">🧪</span>
          <span>Simular Teste de Superdosagem</span>
        </button>
      </div>

      <div class="card-elevated" style="margin-top: 1rem; font-size: 0.83rem; color: var(--text-secondary);">
        <strong>🚨 Sinais de Perigo e Intoxicação (Caderneta da Criança, pág. 23, 58 e 64):</strong>
        Febre (temperatura igual ou maior do que 37,5 ºC) ou temperatura do corpo baixa (menor ou igual a 35,5 ºC em menores de 2 meses; hipotermia &lt; 36,5 ºC nas consultas pág. 70–73) são sinais de alerta. Quando os dentes de leite estão nascendo (por volta dos 6 meses), a criança pode apresentar alteração do sono, perda de apetite, pequeno aumento de temperatura, aumento da salivação, coceira nas gengivas e irritabilidade (pág. 58). Em casos de acidentes com medicamentos e outras substâncias tóxicas, procure urgentemente um serviço de saúde, chame o <strong>SAMU (192)</strong> ou ligue para o <strong>Centro de Informação Toxicológica (0800-722-6001)</strong>.
      </div>
      <app-official-reference page="Caderneta da Criança, p. 23: sinais de perigo; p. 58: nascimento dos dentes; p. 61, 63 e 64: prevenção de intoxicação e envenenamento" />
    </div>
  `
})
export class DoseCalculatorComponent {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  readonly medicationName = signal('Dipirona Gotas (500mg/mL)');
  readonly doseMg = signal(95);
  temperature = 38.2;
  reason = 'Febre (≥ 37,5 °C) / Nascimento dos dentes de leite';

  readonly weightKg = computed(() => +(this.babyStore.activeBaby().currentWeightGrams / 1000).toFixed(2));
  readonly maxSafeMg = computed(() => {
    const isIbu = this.medicationName().toLowerCase().includes('ibuprofeno');
    return +(this.weightKg() * (isIbu ? 10 : 15)).toFixed(1);
  });

  async submitDose(): Promise<void> {
    if (
      !this.medicationName().trim() ||
      !this.doseMg() ||
      this.doseMg() <= 0 ||
      !this.temperature ||
      this.temperature <= 0 ||
      !this.reason.trim()
    ) {
      this.popupAlert.incompleteForm(
        'Preencha a medicação, temperatura aferida, dose solicitada e indicação clínica.'
      );
      return;
    }

    await this.routineStore.administerMedication({
      medicationName: this.medicationName(),
      doseMg: this.doseMg(),
      dosageGiven: `${this.doseMg()} mg`,
      measuredTemperatureCelsius: this.temperature,
      reason: this.reason.trim()
    });
  }

  async simulateOverdoseTest(): Promise<void> {
    this.doseMg.set(250);
    await this.submitDose();
  }
}
