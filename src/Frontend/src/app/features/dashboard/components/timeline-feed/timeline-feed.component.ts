import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BabyStore } from '../../../../core/state/baby.store';
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

        <!-- Filtro Rápido por Categoria e Impressão -->
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-sleep]="categoryFilter() === 'ALL'" (click)="setCategoryFilter('ALL')">
            Todos ({{ store.events().length }})
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-sleep]="categoryFilter() === 'Sleep'" (click)="setCategoryFilter('Sleep')">
            💤 Sono
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-feeding]="categoryFilter() === 'Feeding'" (click)="setCategoryFilter('Feeding')">
            🤱 Alimentação
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-diaper]="categoryFilter() === 'Diaper'" (click)="setCategoryFilter('Diaper')">
            🧷 Fraldas
          </button>
          <button type="button" class="btn" style="min-height: 30px; padding: 0.2rem 0.55rem; font-size: 0.75rem;" [class.btn-health]="categoryFilter() === 'Medication'" (click)="setCategoryFilter('Medication')">
            💊 Saúde
          </button>
          <button
            type="button"
            class="btn no-print"
            style="min-height: 30px; padding: 0.2rem 0.65rem; font-size: 0.75rem;"
            [disabled]="filteredEvents().length === 0"
            (click)="printFilteredTable()"
            title="Imprimir somente os dados da tabela com o filtro atual">
            🖨️ Imprimir Tabela ({{ filteredEvents().length }})
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
              <th class="no-print" style="padding: 0.5rem; text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @if (paginatedEvents().length === 0) {
              <tr>
                <td colspan="5" style="padding: 1rem 0.5rem; text-align: center; color: var(--text-secondary);">
                  Nenhum registro encontrado para o filtro selecionado.
                </td>
              </tr>
            } @else {
              @for (ev of paginatedEvents(); track ev.id) {
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
                  <td class="no-print" style="padding: 0.6rem 0.5rem; white-space: nowrap; text-align: right;">
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
            }
          </tbody>
        </table>
      </div>

      <!-- Barra de Paginação -->
      <div
        class="no-print"
        style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.65rem; margin-top: 0.85rem; padding-top: 0.65rem; border-top: 1px solid var(--border-subtle); font-size: 0.8rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; color: var(--text-secondary);">
          <span>
            Exibindo <strong>{{ pageStartItem() }}–{{ pageEndItem() }}</strong> de <strong>{{ filteredEvents().length }}</strong> registro(s)
          </span>
          <label style="display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;">
            <span>Itens por página:</span>
            <select
              class="input-field"
              style="width: auto; min-height: 30px; padding: 0.15rem 0.45rem; font-size: 0.78rem;"
              [ngModel]="pageSize()"
              (ngModelChange)="onPageSizeChange($event)"
              aria-label="Itens por página">
              @for (size of pageSizeOptions; track size) {
                <option [ngValue]="size">{{ size }}</option>
              }
            </select>
          </label>
        </div>

        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button
            type="button"
            class="btn"
            style="min-height: 30px; padding: 0.15rem 0.55rem; font-size: 0.75rem;"
            [disabled]="effectivePage() <= 1"
            (click)="goToPage(1)"
            title="Primeira página">
            ⏮
          </button>
          <button
            type="button"
            class="btn"
            style="min-height: 30px; padding: 0.15rem 0.6rem; font-size: 0.75rem;"
            [disabled]="effectivePage() <= 1"
            (click)="prevPage()">
            ◀ Anterior
          </button>
          <span style="font-weight: 700; padding: 0 0.35rem;">
            Página {{ effectivePage() }} de {{ totalPages() }}
          </span>
          <button
            type="button"
            class="btn"
            style="min-height: 30px; padding: 0.15rem 0.6rem; font-size: 0.75rem;"
            [disabled]="effectivePage() >= totalPages()"
            (click)="nextPage()">
            Próxima ▶
          </button>
          <button
            type="button"
            class="btn"
            style="min-height: 30px; padding: 0.15rem 0.55rem; font-size: 0.75rem;"
            [disabled]="effectivePage() >= totalPages()"
            (click)="goToPage(totalPages())"
            title="Última página">
            ⏭
          </button>
        </div>
      </div>
    </section>
  `
})
export class TimelineFeedComponent {
  readonly store = inject(RoutineStore);
  readonly babyStore = inject(BabyStore);
  readonly editingEvent = signal<RoutineEventModel | null>(null);
  readonly categoryFilter = signal<string>('ALL');

  readonly pageSizeOptions = [10, 25, 50, 100];
  readonly pageSize = signal<number>(25);
  readonly currentPage = signal<number>(1);

  readonly filteredEvents = computed(() => {
    const all = this.store.events();
    const cat = this.categoryFilter();
    return cat === 'ALL' ? all : all.filter(e => e.category === cat);
  });

  readonly totalPages = computed(() => {
    const total = this.filteredEvents().length;
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly effectivePage = computed(() => {
    return Math.min(Math.max(1, this.currentPage()), this.totalPages());
  });

  readonly paginatedEvents = computed(() => {
    const list = this.filteredEvents();
    const size = this.pageSize();
    const page = this.effectivePage();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  readonly pageStartItem = computed(() => {
    const total = this.filteredEvents().length;
    if (total === 0) return 0;
    return (this.effectivePage() - 1) * this.pageSize() + 1;
  });

  readonly pageEndItem = computed(() => {
    const total = this.filteredEvents().length;
    if (total === 0) return 0;
    return Math.min(total, this.effectivePage() * this.pageSize());
  });

  editTimestampLocal = '';
  editDurationMinutes: number | undefined = undefined;
  editRecordedByName = '';
  editNotes = '';

  setCategoryFilter(cat: string): void {
    this.categoryFilter.set(cat);
    this.currentPage.set(1);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(Number(size) || 25);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    const target = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(target);
  }

  prevPage(): void {
    this.goToPage(this.effectivePage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.effectivePage() + 1);
  }

  printFilteredTable(): void {
    const events = this.filteredEvents();
    const filterKey = this.categoryFilter();
    const filterLabel = filterKey === 'ALL' ? 'Todos os Registros' : this.getCategoryLabel(filterKey);
    const babyName = this.babyStore.activeBaby()?.name || 'Bebê';
    const printedAt = new Date().toLocaleString('pt-BR');

    const rowsHtml = events
      .map(ev => {
        const dt = new Date(ev.timestamp);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formattedDate = `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        const category = `${this.getCategoryIcon(ev.category)} ${this.getCategoryLabel(ev.category)}`;
        const details = this.escapeHtml(this.formatEventDetails(ev));
        const statusNotes = ev.clinicalFlags?.isRedFlagAlert
          ? `🚨 ${this.escapeHtml(ev.clinicalFlags.alertMessage ?? '')}`
          : this.escapeHtml(ev.notes || 'OK');

        return `
          <tr>
            <td class="mono">${formattedDate}</td>
            <td>${this.escapeHtml(category)}</td>
            <td><strong>${details}</strong></td>
            <td>${statusNotes}</td>
          </tr>
        `;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Linha do Tempo de Registros - ${this.escapeHtml(babyName)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 24px;
      font-size: 12px;
    }
    .header {
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #374151;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 8px;
    }
    h1 {
      font-size: 16px;
      margin: 0 0 4px 0;
    }
    .meta {
      font-size: 11px;
      color: #4b5563;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border-bottom: 1px solid #d1d5db;
      padding: 7px 6px;
      text-align: left;
      vertical-align: top;
    }
    th {
      border-bottom: 2px solid #374151;
      font-weight: 700;
      background: #f9fafb;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      white-space: nowrap;
      font-weight: 700;
    }
    @media print {
      body { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📋 Linha do Tempo de Registros — ${this.escapeHtml(babyName)}</h1>
      <div class="meta">Filtro aplicado: <strong>${this.escapeHtml(filterLabel)}</strong> • Total: <strong>${events.length}</strong> registro(s)</div>
    </div>
    <div class="meta">Impresso em: ${this.escapeHtml(printedAt)}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Horário</th>
        <th>Tipo</th>
        <th>Resumo do Registro</th>
        <th>Status / Notas</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const printWin = iframe.contentWindow;
    setTimeout(() => {
      printWin.focus();
      printWin.print();
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1000);
    }, 150);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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
