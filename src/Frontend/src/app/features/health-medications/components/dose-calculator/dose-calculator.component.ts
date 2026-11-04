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
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
        <h3 class="section-title" style="margin-bottom: 0;">
          <span aria-hidden="true">💊</span>
          <span>Administração Segura de Medicamentos</span>
        </h3>
        <span class="badge badge-health">Peso base: {{ weightKg() }} kg</span>
      </div>

      <div class="grid-2" style="margin-bottom: 0.85rem;">
        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Medicamento Prescrito</label>
          <select class="input-field" [ngModel]="medicationName()" (ngModelChange)="medicationName.set($event)">
            <option value="Paracetamol Gotas (200mg/mL)">Paracetamol Gotas (200mg/mL) — Int. 6h</option>
            <option value="Dipirona Gotas (500mg/mL)">Dipirona Sódica (500mg/mL) — Int. 6h</option>
            <option value="Ibuprofeno Infantil (100mg/mL)">Ibuprofeno (100mg/mL) — Int. 8h</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Temperatura (°C)</label>
          <input type="number" step="0.1" class="input-field" [(ngModel)]="temperature" />
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">
            Dose (mg) — Teto seguro: {{ maxSafeMg() }} mg
          </label>
          <input type="number" class="input-field" [ngModel]="doseMg()" (ngModelChange)="doseMg.set(+$event)" />
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Indicação / Sintoma</label>
          <input type="text" class="input-field" [(ngModel)]="reason" />
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button type="button" class="btn btn-health" style="flex: 1;" (click)="submitDose()">
          <span aria-hidden="true">🛡️</span>
          <span>Validar e Registrar Dose</span>
        </button>

        <button type="button" class="btn" (click)="simulateOverdoseTest()" title="Simula tentativa de superdosagem">
          <span aria-hidden="true">🧪</span>
          <span>Testar Bloqueio</span>
        </button>
      </div>

      <details class="info-disclosure">
        <summary>💡 Alertas de Febre, Hipotermia e Intoxicação (pág. 23, 58, 61 e 64)</summary>
        <div class="info-disclosure-body">
          <ul>
            <li>Nunca administre medicamentos sem prescrição médica e mantenha-os fora do alcance da criança (pág. 61 e 63).</li>
            <li><strong>Febre (≥ 37,5 °C) ou Hipotermia (≤ 35,5 °C)</strong> exigem avaliação; em menores de 3 meses a febre é sinal de alerta imediato.</li>
            <li>Emergências toxicológicas: <strong>SAMU (192)</strong> ou <strong>CEATOX (0800-722-6001)</strong>.</li>
          </ul>
          <app-official-reference page="p. 23, 58, 61, 63 e 64" />
        </div>
      </details>
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
