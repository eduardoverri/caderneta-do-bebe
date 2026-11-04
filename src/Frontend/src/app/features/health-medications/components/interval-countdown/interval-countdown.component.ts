import { Component, inject } from '@angular/core';
import { BabyStore } from '../../../../core/state/baby.store';
import { RoutineStore } from '../../../../core/state/routine.store';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-interval-countdown',
  standalone: true,
  imports: [OfficialReferenceComponent],
  template: `
    <div class="card">
      <h3 class="section-title">
        <span aria-hidden="true">⏳</span>
        <span>Registros da Suplementação de Vitamina A, Ferro ou Outros Micronutrientes (pág. 36 e 103)</span>
      </h3>
      <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 0.85rem;">
        <strong>Prevenindo as Carências Nutricionais (pág. 36):</strong> Para evitar a anemia, todas as crianças de 6 a 24 meses devem receber, além da alimentação rica em ferro, fontes extras de ferro de forma preventiva (por meio do suplemento de ferro ou de fortificação). As crianças de 6 meses a 5 anos (6 meses a 4 anos e 11 meses — pág. 103) que residem em área de risco para a deficiência de vitamina A devem ser suplementadas. As crianças que recebem os sachês de micronutrientes em pó (Estratégia NutriSUS) não devem receber outro suplemento de ferro e não necessitam receber a megadose de vitamina A.
      </p>

      @for (med of babyStore.activeBaby().activeMedications; track med.name) {
        <div class="card-elevated" style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 800;">{{ med.name }}</div>
            <div style="font-size: 0.84rem; color: var(--text-secondary);">
              Posologia: {{ med.dose }} • {{ med.frequency }}
            </div>
          </div>
          <button type="button" class="btn btn-diaper" style="min-height: 38px;" (click)="logDailySupplement(med.name, med.dose)">
            <span aria-hidden="true">✅</span>
            <span>Confirmar Dose de Hoje</span>
          </button>
        </div>
      }

      <app-official-reference page="Caderneta da Criança, p. 36: prevenindo as carências nutricionais; p. 103: registros da suplementação de vitamina A, ferro ou outros micronutrientes" />
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
