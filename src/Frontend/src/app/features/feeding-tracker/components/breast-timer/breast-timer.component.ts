import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutineStore } from '../../../../core/state/routine.store';
import { PopupAlertService } from '../../../../core/services/popup-alert.service';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-breast-timer',
  standalone: true,
  imports: [FormsModule, OfficialReferenceComponent],
  template: `
    <div class="grid-2">
      <!-- Card 1: Cronômetro de Amamentação no Peito -->
      <div class="card" style="border-top: 4px solid var(--cat-feeding);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem;">
          <h3 class="section-title" style="margin-bottom: 0;">
            <span aria-hidden="true">🤱</span>
            <span>Amamentação no Peito</span>
          </h3>
          <span class="badge badge-feeding">
            Última mama: {{ store.lastBreastSide() === 'Left' ? 'Esquerda' : 'Direita' }}
          </span>
        </div>

        <div style="text-align: center; margin: 0.85rem 0;">
          <div style="font-size: 0.74rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Tempo Total</div>
          <div class="mono-timer" style="font-size: 2.5rem; font-weight: 800; color: var(--cat-feeding);">
            {{ totalDurationFormatted() }}
          </div>
        </div>

        <div class="grid-2" style="margin-bottom: 0.85rem;">
          <button
            type="button"
            class="btn"
            [style.border-width]="activeSide() === 'Left' ? '3px' : '1px'"
            [style.border-color]="activeSide() === 'Left' ? 'var(--cat-feeding)' : 'var(--border-strong)'"
            style="flex-direction: column; padding: 1rem;"
            (click)="toggleSide('Left')">
            <span style="font-size: 0.84rem; color: var(--text-secondary);">Mama Esquerda</span>
            <span class="mono-timer" style="font-size: 1.55rem; font-weight: 800;">{{ leftDurationFormatted() }}</span>
            <span style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">
              {{ activeSide() === 'Left' ? '● Gravando...' : 'Toque para iniciar' }}
            </span>
          </button>

          <button
            type="button"
            class="btn"
            [style.border-width]="activeSide() === 'Right' ? '3px' : '1px'"
            [style.border-color]="activeSide() === 'Right' ? 'var(--cat-feeding)' : 'var(--border-strong)'"
            style="flex-direction: column; padding: 1rem;"
            (click)="toggleSide('Right')">
            <span style="font-size: 0.84rem; color: var(--text-secondary);">Mama Direita</span>
            <span class="mono-timer" style="font-size: 1.55rem; font-weight: 800;">{{ rightDurationFormatted() }}</span>
            <span style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.2rem;">
              {{ activeSide() === 'Right' ? '● Gravando...' : 'Toque para iniciar' }}
            </span>
          </button>
        </div>

        <button
          type="button"
          class="btn btn-feeding"
          style="width: 100%;"
          (click)="saveFeedingSession()">
          <span aria-hidden="true">💾</span>
          <span>Salvar Mamada no Peito</span>
        </button>

        <details class="info-disclosure">
          <summary>💡 Pega da Mama e Livre Demanda (pág. 24 a 26)</summary>
          <div class="info-disclosure-body">
            <ul>
              <li><strong>Livre demanda:</strong> Exclusivo até 6 meses (sem água, chás ou outros leites) e mantido até 2 anos ou mais.</li>
              <li><strong>Boa pega:</strong> Barriga com barriga, boca bem aberta, lábios virados para fora, queixo tocando a mama e nariz livre.</li>
              <li><strong>Leite posterior:</strong> O leite do fim da mamada é rico em gordura, sacia e faz ganhar peso.</li>
            </ul>
            <app-official-reference page="p. 24 a 26" />
          </div>
        </details>
      </div>

      <!-- Card 2: Leite Materno Extraído ou Fórmula (mL) -->
      <div class="card" style="border-top: 4px solid var(--cat-sleep);">
        <h3 class="section-title">
          <span aria-hidden="true">🥛</span>
          <span>Leite Extraído ou Fórmula (mL)</span>
        </h3>

        <div class="grid-2" style="margin-bottom: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Tipo de Oferta</label>
            <select
              class="input-field"
              [ngModel]="bottleType()"
              (ngModelChange)="bottleType.set($event)">
              <option value="ExpressedMilk">Leite Materno Extraído (copinho/colher)</option>
              <option value="Formula">Leite Artificial / Fórmula (LA)</option>
            </select>
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Volume (mL)</label>
            <input
              type="number"
              class="input-field"
              min="5"
              max="500"
              step="5"
              [ngModel]="bottleVolumeMl()"
              (ngModelChange)="bottleVolumeMl.set(+$event)" />
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.85rem;">
          @for (vol of presetVolumes; track vol) {
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.76rem;"
              [class.btn-sleep]="bottleVolumeMl() === vol"
              (click)="bottleVolumeMl.set(vol)">
              {{ vol }} mL
            </button>
          }
        </div>

        <button
          type="button"
          class="btn btn-sleep"
          style="width: 100%;"
          (click)="saveBottleFeeding()">
          <span aria-hidden="true">🥛</span>
          <span>Registrar {{ bottleType() === 'Formula' ? 'Fórmula' : 'Leite Extraído' }} ({{ bottleVolumeMl() }} mL)</span>
        </button>

        <details class="info-disclosure">
          <summary>💡 Conservação do Leite Materno Extraído (pág. 28 a 30)</summary>
          <div class="info-disclosure-body">
            <ul>
              <li>Conservar em geladeira por até <strong>12 horas</strong> e no freezer/congelador por até <strong>15 dias</strong>.</li>
              <li>Aquecer em banho-maria (fogo desligado); nunca ferver nem usar micro-ondas.</li>
              <li>Oferecer preferencialmente em copo, xícara ou colher (evitar bicos, chupetas e mamadeiras).</li>
            </ul>
            <app-official-reference page="p. 28 a 30" />
          </div>
        </details>
      </div>
    </div>
  `
})
export class BreastTimerComponent {
  readonly store = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  readonly activeSide = signal<'Left' | 'Right' | 'None'>('None');
  readonly leftSeconds = signal(0);
  readonly rightSeconds = signal(0);
  private timerId?: ReturnType<typeof setInterval>;

  readonly bottleType = signal<'Formula' | 'ExpressedMilk'>('ExpressedMilk');
  readonly bottleVolumeMl = signal<number>(120);
  readonly presetVolumes = [30, 60, 90, 120, 150, 180, 210];

  readonly totalDurationFormatted = computed(() => {
    const total = this.leftSeconds() + this.rightSeconds();
    return this.formatSeconds(total);
  });

  readonly leftDurationFormatted = computed(() => this.formatSeconds(this.leftSeconds()));
  readonly rightDurationFormatted = computed(() => this.formatSeconds(this.rightSeconds()));

  toggleSide(side: 'Left' | 'Right'): void {
    if (this.activeSide() === side) {
      this.activeSide.set('None');
      if (this.timerId) clearInterval(this.timerId);
    } else {
      this.activeSide.set(side);
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        if (this.activeSide() === 'Left') {
          this.leftSeconds.update(s => s + 1);
        } else if (this.activeSide() === 'Right') {
          this.rightSeconds.update(s => s + 1);
        }
      }, 1000);
    }
  }

  async saveFeedingSession(): Promise<void> {
    if (this.leftSeconds() <= 0 && this.rightSeconds() <= 0) {
      this.popupAlert.incompleteForm('Inicie o cronômetro em pelo menos uma das mamas antes de salvar a mamada.');
      return;
    }

    if (this.timerId) clearInterval(this.timerId);
    const lastSide = this.activeSide() !== 'None' ? this.activeSide() : (this.rightSeconds() >= this.leftSeconds() ? 'Right' : 'Left');
    this.activeSide.set('None');
    await this.store.logQuickBreastfeeding({
      side: lastSide,
      leftDurationSeconds: this.leftSeconds(),
      rightDurationSeconds: this.rightSeconds(),
      hungerCueStage: 'Early',
      satietyCues: ['Mamou até ficar satisfeita', 'Colocada na posição vertical para arrotar']
    });
    this.leftSeconds.set(0);
    this.rightSeconds.set(0);
  }

  async saveBottleFeeding(): Promise<void> {
    if (!this.bottleType() || !this.bottleVolumeMl() || this.bottleVolumeMl() <= 0) {
      this.popupAlert.incompleteForm('Informe um volume válido em mililitros (mL) antes de salvar.');
      return;
    }
    await this.store.logBottleFeeding({
      feedingType: this.bottleType(),
      volumeMl: this.bottleVolumeMl()
    });
  }

  private formatSeconds(sec: number): string {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
