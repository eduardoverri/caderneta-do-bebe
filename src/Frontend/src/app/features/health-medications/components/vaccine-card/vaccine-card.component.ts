import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BabyStore, VaccineRecord, CampaignVaccineRecord } from '../../../../core/state/baby.store';
import { RoutineStore } from '../../../../core/state/routine.store';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-vaccine-card',
  standalone: true,
  imports: [FormsModule, DatePipe, OfficialReferenceComponent],
  template: `
    <div class="card">
      <!-- Barra Superior de Resumo e Filtros Rápidos -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.85rem;">
        <div>
          <h3 class="section-title" style="margin-bottom: 0.15rem;">
            <span aria-hidden="true">💉</span>
            <span>Calendário Nacional de Vacinação</span>
          </h3>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <span class="badge badge-diaper">✅ {{ appliedCount() }} Aplicadas</span>
            <span class="badge badge-milestone">🗓️ {{ pendingCount() }} Pendentes</span>
            <span class="badge badge-sleep">📢 {{ (babyStore.activeBaby().campaignVaccines || []).length }} Campanhas</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          <button type="button" class="btn" style="min-height: 32px; font-size: 0.78rem;" [class.btn-sleep]="filterGroup() === 'ALL'" (click)="filterGroup.set('ALL')">
            Todas ({{ babyStore.activeBaby().vaccines.length }})
          </button>
          <button type="button" class="btn" style="min-height: 32px; font-size: 0.78rem;" [class.btn-sleep]="filterGroup() === 'ATE_12_MESES'" (click)="filterGroup.set('ATE_12_MESES')">
            Até 12 meses
          </button>
          <button type="button" class="btn" style="min-height: 32px; font-size: 0.78rem;" [class.btn-sleep]="filterGroup() === 'APOS_12_MESES'" (click)="filterGroup.set('APOS_12_MESES')">
            ≥ 12 meses
          </button>
        </div>
      </div>

      <!-- Grade Enxuta das 29 Vacinas -->
      <div class="grid-2" style="margin-bottom: 1rem;">
        @for (vac of filteredVaccines(); track vac.code) {
          <div class="card-elevated" style="display: flex; flex-direction: column; gap: 0.4rem; padding: 0.7rem 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
              <div style="min-width: 0;">
                <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">
                  {{ vac.ageGroupSection || (vac.recommendedMonth === 0 ? 'Ao nascer' : vac.recommendedMonth + ' meses') }} • {{ vac.doseLabel || 'Dose' }}
                </div>
                <div style="font-weight: 800; font-size: 0.9rem;">{{ vac.name }}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0;">
                <button
                  type="button"
                  class="badge"
                  style="cursor: pointer; font: inherit;"
                  [style.opacity]="savingVaccineCode() === vac.code ? '0.6' : '1'"
                  [disabled]="savingVaccineCode() === vac.code"
                  [class]="vac.status === 'Applied' ? 'badge-diaper' : (vac.status === 'Overdue' ? 'badge-health' : 'badge-milestone')"
                  (click)="toggleVaccineStatus(vac)"
                  [title]="vac.status === 'Applied' ? 'Clique para alternar para Pendente' : 'Clique para marcar como Aplicada com a data atual'">
                  {{ vac.status === 'Applied' ? '✅ Aplicada' : (vac.status === 'Overdue' ? '⚠️ Atrasada' : '🗓️ Pendente') }}
                </button>
                <button
                  type="button"
                  class="btn"
                  style="min-height: 28px; padding: 0.15rem 0.45rem; font-size: 0.72rem;"
                  (click)="openEditVaccine(vac)"
                  title="Registrar ou alterar dados desta vacina">
                  {{ editingVaccineCode() === vac.code ? '✕' : '✏️' }}
                </button>
              </div>
            </div>

            @if (vac.status === 'Applied' || vac.lot || vac.healthUnit || vac.laboratory) {
              <div style="font-size: 0.74rem; color: var(--text-secondary); border-top: 1px dashed var(--border-subtle); padding-top: 0.3rem;">
                @if (vac.appliedAt) { <span>📅 <strong>{{ vac.appliedAt | date:'dd/MM/yyyy' }}</strong> • </span> }
                @if (vac.lot) { <span>Lote: <strong>{{ vac.lot }}</strong> • </span> }
                @if (vac.laboratory) { <span>Lab.: <strong>{{ vac.laboratory }}</strong> • </span> }
                @if (vac.healthUnit) { <span>UBS: <strong>{{ vac.healthUnit }}</strong></span> }
              </div>
            }

            @if (editingVaccineCode() === vac.code) {
              <div class="card" style="margin-top: 0.25rem; padding: 0.65rem; border-left: 3px solid var(--cat-diaper);">
                @if (vac.diseasesPrevented) {
                  <div style="font-size: 0.74rem; color: var(--text-secondary); margin-bottom: 0.45rem;">
                    🛡️ <strong>Doenças evitadas:</strong> {{ vac.diseasesPrevented }}
                  </div>
                }
                <div class="grid-2" style="gap: 0.45rem;">
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700;">Situação</label>
                    <select class="input-field" [(ngModel)]="editForm.status">
                      <option value="Pending">🗓️ Pendente</option>
                      <option value="Applied">✅ Aplicada</option>
                      <option value="Overdue">⚠️ Em atraso</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700;">Data</label>
                    <input type="date" class="input-field" [(ngModel)]="editForm.appliedAt" />
                  </div>
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700;">Lote</label>
                    <input type="text" class="input-field" [(ngModel)]="editForm.lot" placeholder="Ex: 2401A" />
                  </div>
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700;">Laboratório</label>
                    <input type="text" class="input-field" [(ngModel)]="editForm.laboratory" placeholder="Bio-Manguinhos / Butantan" />
                  </div>
                  <div>
                    <label style="font-size: 0.72rem; font-weight: 700;">Unidade (UBS)</label>
                    <input type="text" class="input-field" [(ngModel)]="editForm.healthUnit" placeholder="UBS Centro" />
                  </div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 0.4rem; margin-top: 0.55rem;">
                  <button type="button" class="btn" style="min-height: 30px; font-size: 0.75rem;" (click)="editingVaccineCode.set(null)">
                    Cancelar
                  </button>
                  <button type="button" class="btn btn-diaper" style="min-height: 30px; font-size: 0.75rem;" (click)="saveVaccine(vac.code)">
                    💾 Salvar Vacina
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Acordeão para Outras Vacinas e Campanhas (pág. 106) -->
      <details class="section-accordion">
        <summary>📢 Outras Vacinas e Campanhas (Influenza, Covid-19, Multivacinação — pág. 106)</summary>
        <div class="section-accordion-body">
          <div class="grid-3" style="gap: 0.5rem; margin-bottom: 0.65rem;">
            <div>
              <label style="font-size: 0.74rem; font-weight: 700;">Vacina / Campanha</label>
              <input type="text" class="input-field" [(ngModel)]="campaignForm.vaccineName" placeholder="Ex: Influenza / Covid-19" />
            </div>
            <div>
              <label style="font-size: 0.74rem; font-weight: 700;">Dose</label>
              <input type="text" class="input-field" [(ngModel)]="campaignForm.dose" placeholder="Ex: 1ª Dose / Anual" />
            </div>
            <div>
              <label style="font-size: 0.74rem; font-weight: 700;">Data</label>
              <input type="date" class="input-field" [(ngModel)]="campaignForm.date" />
            </div>
            <div>
              <label style="font-size: 0.74rem; font-weight: 700;">Lote</label>
              <input type="text" class="input-field" [(ngModel)]="campaignForm.lot" placeholder="Lote / Fab." />
            </div>
            <div>
              <label style="font-size: 0.74rem; font-weight: 700;">Unidade</label>
              <input type="text" class="input-field" [(ngModel)]="campaignForm.healthUnit" placeholder="UBS" />
            </div>
          </div>

          <button type="button" class="btn btn-sleep" style="min-height: 34px; font-size: 0.8rem; margin-bottom: 0.75rem;" (click)="addCampaignVaccine()">
            ➕ Registrar Vacina de Campanha
          </button>

          @if ((babyStore.activeBaby().campaignVaccines || []).length > 0) {
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                    <th style="padding: 0.4rem;">Vacina</th>
                    <th style="padding: 0.4rem;">Dose</th>
                    <th style="padding: 0.4rem;">Data</th>
                    <th style="padding: 0.4rem;">Lote</th>
                    <th style="padding: 0.4rem;">Unidade</th>
                    <th style="padding: 0.4rem;">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cv of babyStore.activeBaby().campaignVaccines; track cv.id) {
                    <tr style="border-bottom: 1px solid var(--border-subtle);">
                      <td style="padding: 0.4rem; font-weight: 700;">{{ cv.vaccineName }}</td>
                      <td style="padding: 0.4rem;">{{ cv.dose }}</td>
                      <td style="padding: 0.4rem;">{{ cv.date }}</td>
                      <td style="padding: 0.4rem;">{{ cv.lot }}</td>
                      <td style="padding: 0.4rem;">{{ cv.healthUnit }}</td>
                      <td style="padding: 0.4rem;">
                        <button type="button" class="btn" style="min-height: 26px; padding: 0.1rem 0.45rem; font-size: 0.72rem;" (click)="deleteCampaign(cv.id)">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </details>

      <!-- Quadro Ilustrado Oficial e Orientações Recolhidos sob Demanda -->
      <details class="info-disclosure">
        <summary>💡 Quadro Oficial do Calendário Nacional e Orientações (pág. 15, 104 e 105)</summary>
        <div class="info-disclosure-body">
          <p style="margin-bottom: 0.6rem;">
            Amamentar durante a aplicação da vacina ajuda a deixar a criança mais tranquila (pág. 15).
          </p>
          <div class="grid-2">
            <img src="imagens/p106_pag104_calendario_nacional_vacinacao.jpg" alt="Calendário Nacional de Vacinação pág. 104" style="width: 100%; border-radius: 8px; border: 1px solid var(--border-subtle);" loading="lazy" />
            <img src="imagens/p107_pag105_registro_aplicacao_vacinas.jpg" alt="Registro da Aplicação das Vacinas pág. 105" style="width: 100%; border-radius: 8px; border: 1px solid var(--border-subtle);" loading="lazy" />
          </div>
          <app-official-reference page="p. 15, 104, 105 e 106" />
        </div>
      </details>
    </div>
  `
})
export class VaccineCardComponent {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);

  readonly filterGroup = signal<'ALL' | 'ATE_12_MESES' | 'APOS_12_MESES'>('ALL');
  readonly editingVaccineCode = signal<string | null>(null);
  readonly savingVaccineCode = signal<string | null>(null);

  readonly appliedCount = computed(() =>
    (this.babyStore.activeBaby().vaccines || []).filter(v => v.status === 'Applied').length
  );
  readonly pendingCount = computed(() =>
    (this.babyStore.activeBaby().vaccines || []).filter(v => v.status !== 'Applied').length
  );

  editForm = {
    status: 'Applied' as 'Pending' | 'Applied' | 'Overdue',
    appliedAt: new Date().toISOString().slice(0, 10),
    lot: '',
    laboratory: '',
    healthUnit: '',
    signature: ''
  };

  campaignForm: CampaignVaccineRecord = {
    id: '',
    vaccineName: '',
    dose: 'Dose Campanha',
    date: new Date().toISOString().slice(0, 10),
    lot: '',
    healthUnit: '',
    signature: ''
  };

  filteredVaccines(): VaccineRecord[] {
    const all = this.babyStore.activeBaby().vaccines || [];
    const filter = this.filterGroup();
    if (filter === 'ATE_12_MESES') {
      return all.filter(v => v.recommendedMonth < 12);
    }
    if (filter === 'APOS_12_MESES') {
      return all.filter(v => v.recommendedMonth >= 12);
    }
    return all;
  }

  openEditVaccine(vac: VaccineRecord): void {
    if (this.editingVaccineCode() === vac.code) {
      this.editingVaccineCode.set(null);
      return;
    }
    this.editForm = {
      status: vac.status || 'Applied',
      appliedAt: vac.appliedAt ? vac.appliedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      lot: vac.lot || '',
      laboratory: vac.laboratory || '',
      healthUnit: vac.healthUnit || '',
      signature: vac.signature || ''
    };
    this.editingVaccineCode.set(vac.code);
  }

  async toggleVaccineStatus(vac: VaccineRecord): Promise<void> {
    if (this.savingVaccineCode()) return;
    this.savingVaccineCode.set(vac.code);
    try {
      const nextStatus: 'Pending' | 'Applied' = vac.status === 'Applied' ? 'Pending' : 'Applied';
      const today = new Date().toISOString().slice(0, 10);
      this.editForm = {
        status: nextStatus,
        appliedAt: today,
        lot: vac.lot || '',
        laboratory: vac.laboratory || '',
        healthUnit: vac.healthUnit || '',
        signature: vac.signature || ''
      };
      await this.saveVaccine(vac.code);
    } finally {
      this.savingVaccineCode.set(null);
    }
  }

  readonly toggleVaccine = this.toggleVaccineStatus.bind(this);

  async saveVaccine(code: string): Promise<void> {
    await this.routineStore.updateNationalVaccine(code, {
      status: this.editForm.status,
      appliedAt: this.editForm.status === 'Applied' && this.editForm.appliedAt
        ? new Date(`${this.editForm.appliedAt}T12:00:00`).toISOString()
        : undefined,
      lot: this.editForm.lot,
      laboratory: this.editForm.laboratory,
      healthUnit: this.editForm.healthUnit,
      signature: this.editForm.signature
    });
    this.editingVaccineCode.set(null);
  }

  async addCampaignVaccine(): Promise<void> {
    if (!this.campaignForm.vaccineName.trim()) return;
    await this.routineStore.upsertCampaignVaccine({
      ...this.campaignForm,
      id: `CAMP-${Date.now()}`
    });
    this.campaignForm = {
      id: '',
      vaccineName: '',
      dose: 'Dose Campanha',
      date: new Date().toISOString().slice(0, 10),
      lot: '',
      healthUnit: '',
      signature: ''
    };
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.routineStore.deleteCampaignVaccine(id);
  }
}
