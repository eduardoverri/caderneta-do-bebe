import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoutineEventModel, RoutineStore } from '../../../../core/state/routine.store';

@Component({
  selector: 'app-timeline-feed',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <section class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
        <h3 class="section-title" style="margin-bottom: 0;">
          <span aria-hidden="true">📋</span>
          <span>Linha do Tempo de Registros</span>
        </h3>

        <!-- Filtro Rápido por Categoria para Reduzir Densidade da Tabela -->
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-sleep]="categoryFilter() === 'ALL'" (click)="categoryFilter.set('ALL')">
            Todos ({{ store.events().length }})
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-sleep]="categoryFilter() === 'Sleep'" (click)="categoryFilter.set('Sleep')">
            💤 Sono
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-feeding]="categoryFilter() === 'Feeding'" (click)="categoryFilter.set('Feeding')">
            🤱 Alimentação
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-diaper]="categoryFilter() === 'Diaper'" (click)="categoryFilter.set('Diaper')">
            🧷 Fraldas
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-health]="categoryFilter() === 'Medication'" (click)="categoryFilter.set('Medication')">
            💊 Saúde
          </button>
        </div>
      </div>

      @if (editingEvent(); as editEv) {
        <div class="card-elevated" style="border: 2px solid var(--cat-sleep); margin-bottom: 0.85rem;">
          <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem;">
            ✏️ Alterar Registro ({{ getCategoryLabel(editEv.category) }})
          </h4>
          <div class="grid-3" style="gap: 0.65rem;">
            <div>
              <label style="font-size: 0.75rem; font-weight: 600;">Data e Horário</label>
              <input type="datetime-local" [(ngModel)]="editTimestampLocal" />
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 600;">Duração (min)</label>
              <input type="number" min="0" [(ngModel)]="editDurationMinutes" placeholder="Ex: 30" />
            </div>
            <div>
              <label style="font-size: 0.75rem; font-weight: 600;">Cuidador</label>
              <input type="text" [(ngModel)]="editRecordedByName" />
            </div>
          </div>
          <div style="margin-top: 0.5rem;">
            <label style="font-size: 0.75rem; font-weight: 600;">Observações</label>
            <input type="text" [(ngModel)]="editNotes" placeholder="Observações clínicas ou da rotina..." />
          </div>
          <div style="display: flex; gap: 0.45rem; margin-top: 0.65rem;">
            <button type="button" class="btn btn-primary" style="min-height: 34px; font-size: 0.8rem;" (click)="saveEditedEvent()">💾 Salvar</button>
            <button type="button" class="btn" style="min-height: 34px; font-size: 0.8rem;" (click)="cancelEdit()">Cancelar</button>
          </div>
        </div>
      }

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
              <th style="padding: 0.5rem;">Horário</th>
              <th style="padding: 0.5rem;">Tipo</th>
              <th style="padding: 0.5rem;">Resumo do Registro</th>
              <th style="padding: 0.5rem;">Status / Notas</th>
              <th style="padding: 0.5rem; text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (ev of filteredEvents(); track ev.id) {
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td class="mono-timer" style="padding: 0.6rem 0.5rem; font-weight: 700; white-space: nowrap;">
                  {{ ev.timestamp | date:'dd/MM HH:mm' }}
                </td>
                <td style="padding: 0.6rem 0.5rem; white-space: nowrap;">
                  <span class="badge" [class]="getCategoryBadgeClass(ev.category)">
                    <span aria-hidden="true">{{ getCategoryIcon(ev.category) }}</span>
                    <span>{{ getCategoryLabel(ev.category) }}</span>
                  </span>
                </td>
                <td style="padding: 0.6rem 0.5rem; font-weight: 600;">
                  {{ formatEventDetails(ev) }}
                </td>
                <td style="padding: 0.6rem 0.5rem;">
                  @if (ev.clinicalFlags.isRedFlagAlert) {
                    <span class="badge badge-health">🚨 {{ ev.clinicalFlags.alertMessage }}</span>
                  } @else {
                    <span style="color: var(--text-secondary); font-size: 0.8rem;">{{ ev.notes || 'OK' }}</span>
                  }
                </td>
                <td style="padding: 0.6rem 0.5rem; white-space: nowrap; text-align: right;">
                  <div style="display: inline-flex; gap: 0.3rem;">
                    <button type="button" class="btn" style="min-height: 28px; padding: 0.15rem 0.5rem; font-size: 0.74rem;" (click)="startEdit(ev)" title="Alterar">
                      ✏️
                    </button>
                    <button type="button" class="btn" style="min-height: 28px; padding: 0.15rem 0.5rem; font-size: 0.74rem; color: var(--cat-health);" (click)="removeEvent(ev.id)" title="Excluir">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class TimelineFeedComponent {
  readonly store = inject(RoutineStore);
  readonly editingEvent = signal<RoutineEventModel | null>(null);
  readonly categoryFilter = signal<string>('ALL');

  readonly filteredEvents = computed(() => {
    const all = this.store.events();
    const cat = this.categoryFilter();
    return cat === 'ALL' ? all : all.filter(e => e.category === cat);
  });

  editTimestampLocal = '';
  editDurationMinutes: number | undefined = undefined;
  editRecordedByName = '';
  editNotes = '';

  startEdit(ev: RoutineEventModel): void {
    this.editingEvent.set(ev);
    const dt = new Date(ev.timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.editTimestampLocal = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    this.editDurationMinutes = ev.durationMinutes;
    this.editRecordedByName = ev.recordedByName;
    this.editNotes = ev.notes ?? '';
  }

  cancelEdit(): void {
    this.editingEvent.set(null);
  }

  async saveEditedEvent(): Promise<void> {
    const ev = this.editingEvent();
    if (!ev) return;

    await this.store.updateRoutineEvent(ev.id, {
      category: ev.category,
      timestamp: this.editTimestampLocal ? new Date(this.editTimestampLocal).toISOString() : ev.timestamp,
      durationMinutes: this.editDurationMinutes,
      recordedByName: this.editRecordedByName,
      notes: this.editNotes,
      details: ev.details
    });
    this.editingEvent.set(null);
  }

  async removeEvent(eventId: string): Promise<void> {
    await this.store.deleteRoutineEvent(eventId);
  }

  getCategoryIcon(cat: string): string {
    switch (cat) {
      case 'Sleep': return '💤';
      case 'Feeding': return '🤱';
      case 'Diaper': return '🧷';
      case 'Medication': return '💊';
      case 'Bath': return '🛁';
      case 'WakeUp': return '☀️';
      default: return '📌';
    }
  }

  getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'Sleep': return 'Sono';
      case 'Feeding': return 'Alimentação';
      case 'Diaper': return 'Fralda';
      case 'Medication': return 'Saúde';
      case 'Bath': return 'Banho';
      case 'WakeUp': return 'Despertar';
      default: return cat;
    }
  }

  getCategoryBadgeClass(cat: string): string {
    switch (cat) {
      case 'Sleep':
      case 'WakeUp': return 'badge badge-sleep';
      case 'Feeding': return 'badge badge-feeding';
      case 'Diaper':
      case 'Bath': return 'badge badge-diaper';
      case 'Medication': return 'badge badge-health';
      default: return 'badge';
    }
  }

  formatEventDetails(ev: RoutineEventModel): string {
    const d = ev.details;
    if (ev.category === 'Diaper') {
      const code = `${d.state ?? 'U'}${d.volumeLevel ?? 2}`;
      const color = d.stoolColor ? ` • Cor: ${d.stoolColor}` : '';
      return `Fralda ${code}${color}`;
    }
    if (ev.category === 'Sleep') {
      const type = d.sleepType === 'NightSleep' ? 'Sono Noturno' : 'Soneca';
      const dur = ev.durationMinutes ? ` (${ev.durationMinutes} min)` : '';
      return `${type}${dur} • ${d.sleepLocation ?? 'Berço'}`;
    }
    if (ev.category === 'Feeding') {
      if (d.feedingType === 'Solids' && d.solidsDetails) {
        const fg = d.solidsDetails.foodGroups;
        const items = [
          ...(fg.fruitsAndVegetables ?? []),
          ...(fg.cerealsAndTubers ?? []),
          ...(fg.legumes ?? []),
          ...(fg.animalProtein ?? [])
        ].join(', ');
        return `Prato (${d.solidsDetails.mealType}): ${items}`;
      }
      if (d.breastfeedingDetails) {
        const bf = d.breastfeedingDetails;
        const side = bf.lastSideOffered === 'Left' ? 'Mama Esq.' : bf.lastSideOffered === 'Right' ? 'Mama Dir.' : 'Ambas';
        return `${side} (${ev.durationMinutes ?? 15} min)`;
      }
      if (d.formulaVolumeMl) {
        return `${d.feedingType === 'Formula' ? 'Fórmula' : 'Leite Extraído'} (${d.formulaVolumeMl} mL)`;
      }
      return `Alimentação (${ev.durationMinutes ?? 15} min)`;
    }
    if (ev.category === 'Medication') {
      return `${d.medicationName ?? 'Medicação'} • ${d.dosageGiven ?? d.dosageMg + 'mg'}`;
    }
    if (ev.category === 'WakeUp') {
      return 'Despertar matinal';
    }
    return ev.notes ?? 'Registro';
  }
}
