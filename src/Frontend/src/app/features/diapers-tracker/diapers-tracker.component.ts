import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutineStore } from '../../core/state/routine.store';
import { BabyStore } from '../../core/state/baby.store';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';
import { QuickCodePadComponent } from './components/quick-code-pad/quick-code-pad.component';
import { StoolVisualPickerComponent } from './components/stool-visual-picker/stool-visual-picker.component';
import { OfficialReferenceComponent } from '../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-diapers-tracker',
  standalone: true,
  imports: [FormsModule, QuickCodePadComponent, StoolVisualPickerComponent, OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-diaper);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem;">
        <div>
          <h3 class="section-title" style="margin-bottom: 0.1rem;">
            <span aria-hidden="true">🧷</span>
            <span>Registro Rápido de Fraldas e Fezes</span>
          </h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary);">
            Código: <strong class="mono-timer" style="font-size: 1rem;">{{ state }}{{ volume }}</strong>
            • {{ store.hydrationStatusMessage() }}
          </p>
        </div>
        <span class="badge badge-diaper">
          {{ store.totalDiaperChanges() }} trocas hoje
        </span>
      </div>

      <app-quick-code-pad
        [selectedState]="state"
        [selectedVolume]="volume"
        (selectState)="state = $event"
        (selectVolume)="volume = $event" />

      @if (state === 'E' || state === 'M') {
        <app-stool-visual-picker
          [selectedColor]="stoolColor"
          [selectedConsistency]="stoolConsistency"
          (selectColor)="stoolColor = $event"
          (selectConsistency)="stoolConsistency = $event" />
      }

      <div class="card-elevated" style="margin-bottom: 0.85rem; display: flex; flex-wrap: wrap; gap: 1.25rem; align-items: center;">
        <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.84rem; cursor: pointer;">
          <input type="checkbox" [(ngModel)]="barrierCreamApplied" style="width: 17px; height: 17px;" />
          <span>✅ Higiene com água / proteção contra assaduras (sem talco)</span>
        </label>

        <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.84rem; cursor: pointer;">
          <input type="checkbox" [(ngModel)]="hasBlood" style="width: 17px; height: 17px;" />
          <span>⚠️ Presença de sangue nas fezes (Sinal de Perigo)</span>
        </label>
      </div>

      <button type="button" class="btn btn-diaper" style="width: 100%; font-size: 0.95rem;" (click)="saveDiaper()">
        <span aria-hidden="true">💾</span>
        <span>SALVAR FRALDA ({{ state }}{{ volume }})</span>
      </button>

      <details class="info-disclosure">
        <summary>💡 Escala de Cores das Fezes e Sinais de Desidratação (pág. 18 a 23)</summary>
        <div class="info-disclosure-body">
          <ul>
            <li><strong>Troca de fraldas (pág. 18):</strong> Limpe preferencialmente com água morna e nunca utilize talco (risco de sufocação — pág. 61).</li>
            <li><strong>Alerta de Atresia Biliar (pág. 18):</strong> Fezes esbranquiçadas, acinzentadas ou amareladas muito claras exigem avaliação médica de urgência.</li>
            <li><strong>Sinais de desidratação (pág. 21):</strong> Olhos fundos, muita sede, choro sem lágrimas, boca seca e pouca urina. Oferecer Soro de Reidratação Oral (SRO).</li>
          </ul>
          <app-official-reference page="p. 18 a 23" />
        </div>
      </details>
    </div>
  `
})
export class DiapersTrackerComponent implements OnInit {
  readonly store = inject(RoutineStore);
  private readonly babyStore = inject(BabyStore);
  private readonly loadingOverlay = inject(LoadingOverlayService);

  state = 'M';
  volume = 2;
  stoolColor = 'Mustard';
  stoolConsistency = 'MoldedPastous';
  barrierCreamApplied = true;
  hasBlood = false;

  async ngOnInit(): Promise<void> {
    const babyId = this.babyStore.selectedBabyId();
    if (babyId) {
      await this.loadingOverlay.runWithLoading(
        () => this.store.refreshDiapers(babyId),
        'Carregando registros de fraldas e hidratação...'
      );
    }
  }

  async saveDiaper(): Promise<void> {
    await this.store.logQuickDiaper({
      code: `${this.state}${this.volume}`,
      volumeLevel: this.volume,
      stoolColor: this.state === 'E' || this.state === 'M' ? this.stoolColor : undefined,
      stoolConsistency: this.state === 'E' || this.state === 'M' ? this.stoolConsistency : undefined,
      hasBlood: this.hasBlood || this.stoolColor === 'RedBlood',
      barrierCreamApplied: this.barrierCreamApplied
    });
  }
}
