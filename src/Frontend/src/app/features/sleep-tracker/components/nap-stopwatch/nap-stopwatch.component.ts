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
        <span>O Sono do Bebê — Registro do Tempo e da Posição no Sono (pág. 17, 41, 42 e 71)</span>
      </h3>

      <div style="text-align: center; padding: 1rem; background: var(--bg-surface-elevated); border-radius: 16px; margin-bottom: 1rem;">
        <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Duração do Sono em Andamento</div>
        <div class="mono-timer" style="font-size: 2.6rem; font-weight: 800; color: var(--cat-sleep); margin: 0.35rem 0;">
          {{ formattedElapsed() }}
        </div>
        <div style="display: flex; justify-content: center; gap: 0.75rem; margin-top: 0.5rem;">
          <button type="button" class="btn btn-sleep" (click)="toggleTimer()">
            <span aria-hidden="true">{{ isRunning() ? '⏸️' : '▶️' }}</span>
            <span>{{ isRunning() ? 'Pausar Cronômetro' : 'Iniciar Sono Agora' }}</span>
          </button>
        </div>
      </div>

      <div class="grid-2">
        <div>
          <label style="font-size: 0.84rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Período do Sono (pág. 17)</label>
          <select class="input-field" [(ngModel)]="sleepType">
            <option value="Nap">Sono Diurno (Ambiente normalmente iluminado e barulho normal)</option>
            <option value="NightSleep">Sono Noturno (Ambiente escuro e silencioso)</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.84rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Duração (Minutos)</label>
          <input type="number" class="input-field" [(ngModel)]="durationMinutes" min="5" max="720" />
        </div>

        <div>
          <label style="font-size: 0.84rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Local e Posição no Sono (pág. 17, 61 e 71)</label>
          <select class="input-field" [(ngModel)]="sleepLocation">
            <option value="Crib">Berço ou rede ao lado da cama dos pais (De barriga para cima, sem travesseiro/cobertor)</option>
            <option value="Lap">Colo / Posição Canguru (Contato pele a pele — pág. 16, 19 e 20)</option>
            <option value="Stroller">Carrinho / Lugar tranquilo, arejado e limpo</option>
            <option value="CoSleeping">Alojamento conjunto / Cuidados noturnos</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.84rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Como Acalmou / Dormiu (pág. 16, 40 a 42)</label>
          <select class="input-field" [(ngModel)]="fallingAsleepMethod">
            <option value="Canções de ninar suaves e leitura">Canções de ninar suaves e leitura na rotina do sono (pág. 41 e 42)</option>
            <option value="Aconchego no colo e toque suave">Aconchego no colo e voz suave dos pais (pág. 16)</option>
            <option value="Amamentação no peito">Amamentação no peito (fonte de nutrição e segurança — pág. 16)</option>
            <option value="Deitada de barriga para cima no berço">Tranquila no berço (de barriga para cima, boca e nariz descobertos — pág. 17)</option>
          </select>
        </div>
      </div>

      <div style="margin-top: 0.85rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
          <input type="checkbox" [(ngModel)]="hadResistance" style="width: 18px; height: 18px;" />
          <span>Apresentou dificuldade com o sono ou alteração do sono (pág. 53, 58 e 66)</span>
        </label>
      </div>

      <button type="button" class="btn btn-sleep" style="width: 100%; margin-top: 1rem;" (click)="saveSleep()">
        <span aria-hidden="true">💾</span>
        <span>Concluir e Salvar Sessão de Sono</span>
      </button>

      <div class="card-elevated" style="margin-top: 1rem; font-size: 0.85rem;">
        <div style="font-weight: 700; margin-bottom: 0.35rem;">🌙 O sono do bebê — orientações oficiais (pág. 17, 41, 42 e 61)</div>
        <ul style="padding-left: 1.2rem; color: var(--text-secondary);">
          <li>O bebê recém-nascido dorme muito. Por isso, ele precisa de um lugar tranquilo, arejado e limpo para dormir.</li>
          <li>Cuide para que ele permaneça de <strong>barriga para cima</strong>. Observe se sua boca e nariz estão descobertos.</li>
          <li>Não use travesseiro e cobertor e agasalhe-o com roupa adequada à temperatura do ambiente. Ajuste o lençol do colchão, cuidando para que o rosto do bebê não seja encoberto por lençóis, cobertores, almofadas e travesseiros. Proteja o berço e o cercado com grades altas com, no máximo, 6 cm entre elas (pág. 61).</li>
          <li>Para facilitar os cuidados e a amamentação durante a noite, nos primeiros meses de vida, coloque o berço ou a rede do bebê ao lado da cama ou da rede dos pais ou cuidadores.</li>
          <li>Durante o dia o sono do bebê pode ser em ambiente normalmente iluminado e com exposição ao barulho normal e à noite em ambiente escuro e silencioso.</li>
          <li>Na hora de colocá-la para dormir, as canções suaves ajudam muito a acalmá-la (pág. 41). Aproveite o momento de dormir ou a rotina do sono para ler por alguns minutos para seu neném (pág. 42).</li>
          <li><strong>Sinal de perigo (pág. 23):</strong> Criança muito sonolenta, com dificuldade para acordar — procure o serviço de urgência ou ligue para 192 - SAMU (a ligação é gratuita).</li>
        </ul>
        <app-official-reference page="Caderneta da Criança, p. 17: o sono do bebê; p. 23: sinais de perigo; p. 41 e 42: rotina do sono; p. 61: prevenção de sufocação e quedas" />
      </div>
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
