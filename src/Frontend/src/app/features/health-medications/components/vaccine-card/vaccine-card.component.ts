import { Component, inject } from '@angular/core';
import { BabyStore } from '../../../../core/state/baby.store';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-vaccine-card',
  standalone: true,
  imports: [OfficialReferenceComponent],
  template: `
    <div class="card" style="margin-top: 1rem;">
      <h3 class="section-title">
        <span aria-hidden="true">💉</span>
        <span>Vacinação — Calendário Nacional de Vacinação da Criança (pág. 15, 104 e 105)</span>
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
        O Calendário Nacional de Vacinação (pág. 104) traz os nomes de todas as vacinas que sua filha precisa receber para ficar protegida de doenças. A vacinação é gratuita no Sistema Único de Saúde (SUS). As vacinas estão disponíveis nas unidades básicas de saúde e durante as campanhas de vacinação. Amamentar durante a aplicação da vacina pode deixar a criança mais tranquila. Se você pode, amamente durante esse procedimento (pág. 15).
      </p>

      <div class="grid-2">
        @for (vac of babyStore.activeBaby().vaccines; track vac.code) {
          <div class="card-elevated" style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
            <div>
              <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">
                {{ vac.recommendedMonth === 0 ? 'AO NASCER' : vac.recommendedMonth + ' MESES' }}
              </div>
              <div style="font-weight: 700; font-size: 0.92rem;">{{ vac.name }}</div>
            </div>
            <span class="badge" [class]="vac.status === 'Applied' ? 'badge-diaper' : 'badge-milestone'">
              <span aria-hidden="true">{{ vac.status === 'Applied' ? '✅' : '🗓️' }}</span>
              <span>{{ vac.status === 'Applied' ? 'Aplicada' : 'Pendente' }}</span>
            </span>
          </div>
        }
      </div>

      <app-official-reference page="Caderneta da Criança, p. 15: prevenir doenças pela triagem neonatal e vacinação; p. 104: Calendário Nacional de Vacinação da Criança; p. 105: registro da aplicação das vacinas" />
    </div>
  `
})
export class VaccineCardComponent {
  readonly babyStore = inject(BabyStore);
}
