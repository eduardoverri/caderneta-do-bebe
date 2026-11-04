import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutineStore } from '../../../../core/state/routine.store';
import { PopupAlertService } from '../../../../core/services/popup-alert.service';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-nap-stopwatch',
  standalone: true,
  imports: [FormsModule, OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-sleep);">
      <h3 class="section-title">
        <span aria-hidden="true">⏱️</span>
        <span>Registrar Sessão de Sono</span>
      </h3>

      <!-- Cronômetro de Ação Imediata -->
      <div style="text-align: center; padding: 0.85rem; background: var(--bg-surface-elevated); border-radius: 14px; margin-bottom: 0.85rem;">
        <div style="font-size: 0.74rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Cronômetro de Sono</div>
        <div class="mono-timer" style="font-size: 2.3rem; font-weight: 800; color: var(--cat-sleep); margin: 0.2rem 0;">
          {{ formattedElapsed() }}
        </div>
        <button type="button" class="btn btn-sleep" (click)="toggleTimer()">
          <span aria-hidden="true">{{ isRunning() ? '⏸️' : '▶️' }}</span>
          <span>{{ isRunning() ? 'Pausar Cronômetro' : 'Iniciar Cronômetro Agora' }}</span>
        </button>
      </div>

      <!-- Campos de Registro Enxutos -->
      <div class="grid-2">
        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Período</label>
          <select class="input-field" [(ngModel)]="sleepType">
            <option value="Nap">☀️ Sono Diurno (Soneca)</option>
            <option value="NightSleep">🌙 Sono Noturno</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Duração (minutos)</label>
          <input type="number" class="input-field" [(ngModel)]="durationMinutes" min="5" max="720" />
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Local</label>
          <select class="input-field" [(ngModel)]="sleepLocation">
            <option value="Crib">Berço (barriga para cima)</option>
            <option value="Lap">Colo / Posição Canguru</option>
            <option value="Stroller">Carrinho</option>
            <option value="CoSleeping">Alojamento conjunto</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Como adormeceu</label>
          <select class="input-field" [(ngModel)]="fallingAsleepMethod">
            <option value="Canções de ninar suaves e leitura">Canções suaves / leitura</option>
            <option value="Aconchego no colo e toque suave">Aconchego no colo</option>
            <option value="Amamentação no peito">Amamentação no peito</option>
            <option value="Deitada de barriga para cima no berço">Sozinha no berço</option>
          </select>
        </div>
      </div>

      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.84rem; margin-top: 0.75rem;">
        <input type="checkbox" [(ngModel)]="hadResistance" style="width: 17px; height: 17px;" />
        <span>Apresentou resistência ou dificuldade para dormir</span>
      </label>

      <button type="button" class="btn btn-sleep" style="width: 100%; margin-top: 0.85rem;" (click)="saveSleep()">
        <span aria-hidden="true">💾</span>
        <span>Salvar Sessão de Sono</span>
      </button>

      <!-- Orientações Recolhidas sob Demanda -->
      <details class="info-disclosure">
        <summary>💡 Orientações Oficiais sobre Sono Seguro (pág. 17, 41, 42 e 61)</summary>
        <div class="info-disclosure-body">
          <ul>
            <li>Sempre posicionar o bebê de <strong>barriga para cima</strong>, com boca e nariz descobertos, sem travesseiro, cobertor ou objetos soltos no berço (grades com no máximo 6 cm entre elas — pág. 61).</li>
            <li>Dia: ambiente normalmente iluminado e barulho habitual; Noite: ambiente escuro e silencioso.</li>
            <li><strong>Sinal de perigo (pág. 23):</strong> Criança muito sonolenta, com dificuldade para acordar — procure urgência ou ligue 192 (SAMU).</li>
          </ul>
          <app-official-reference page="p. 17, 23, 41, 42 e 61" />
        </div>
      </details>
    </div>
  `
})
export class NapStopwatchComponent {
  readonly store = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  readonly isRunning = signal(false);
  readonly elapsedSeconds = signal(0);
  private intervalId?: ReturnType<typeof setInterval>;

  sleepType: 'Nap' | 'NightSleep' = 'Nap';
  durationMinutes = 75;
  sleepLocation = 'Crib';
  fallingAsleepMethod = 'Canções de ninar suaves e leitura';
  hadResistance = false;

  formattedElapsed(): string {
    const total = this.elapsedSeconds();
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  toggleTimer(): void {
    if (this.isRunning()) {
      this.isRunning.set(false);
      if (this.intervalId) clearInterval(this.intervalId);
      if (this.elapsedSeconds() >= 60) {
        this.durationMinutes = Math.round(this.elapsedSeconds() / 60);
      }
    } else {
      this.isRunning.set(true);
      this.intervalId = setInterval(() => {
        this.elapsedSeconds.update(s => s + 1);
      }, 1000);
    }
  }

  async saveSleep(): Promise<void> {
    if (this.isRunning()) this.toggleTimer();
    if (!this.durationMinutes || this.durationMinutes <= 0 || !this.sleepType || !this.sleepLocation || !this.fallingAsleepMethod) {
      this.popupAlert.incompleteForm('Informe uma duração válida em minutos e preencha os campos da sessão de sono.');
      return;
    }

    await this.store.logSleepSession({
      sleepType: this.sleepType,
      durationMinutes: this.durationMinutes,
      sleepLocation: this.sleepLocation,
      fallingAsleepMethod: this.fallingAsleepMethod,
      sleepQuality: this.hadResistance ? 'Restless' : 'Good',
      awakeningsCount: 0,
      hadResistance: this.hadResistance
    });
    this.elapsedSeconds.set(0);
  }
}
