import { Component, inject } from '@angular/core';
import { BabyStore } from '../../../../core/state/baby.store';
import { RoutineStore } from '../../../../core/state/routine.store';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-interval-countdown',
  standalone: true,
  imports: [OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-diaper);">
      <h3 class="section-title">
        <span aria-hidden="true">⏳</span>
        <span>Suplementação Diária em Uso</span>
      </h3>

      @for (med of babyStore.activeBaby().activeMedications; track med.name) {
        <div class="card-elevated" style="margin-bottom: 0.65rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 800; font-size: 0.92rem;">{{ med.name }}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">
              {{ med.dose }} • {{ med.frequency }}
            </div>
          </div>
          <button type="button" class="btn btn-diaper" style="min-height: 34px; font-size: 0.8rem;" (click)="logDailySupplement(med.name, med.dose)">
            <span aria-hidden="true">✅</span>
            <span>Confirmar Dose</span>
          </button>
        </div>
      }

      <details class="info-disclosure">
        <summary>💡 Prevenção de Anemia e Deficiência de Vitamina A (pág. 36 e 103)</summary>
        <div class="info-disclosure-body">
          <p>
            Todas as crianças de 6 a 24 meses devem receber suplementação preventiva de ferro. Crianças de 6 meses a 4 anos e 11 meses em áreas de risco recebem megadoses de Vitamina A (exceto quando em uso de sachês NutriSUS).
          </p>
          <app-official-reference page="p. 36 e 103" />
        </div>
      </details>
    </div>
  `
})
export class IntervalCountdownComponent {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);

  async logDailySupplement(name: string, dose: string): Promise<void> {
    await this.routineStore.administerMedication({
      medicationName: name,
      doseMg: 10,
      dosageGiven: dose,
      reason: 'Suplementação preventiva (Caderneta da Criança, pág. 36 e 103)'
    });
  }
}
