import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RoutineStore } from '../../../core/state/routine.store';
import { WakeWindowTimerService } from '../../../core/services/wake-window-timer.service';
import { DurationPipe } from '../../pipes/duration.pipe';
import { OfficialReferenceComponent } from '../official-reference/official-reference.component';

@Component({
  selector: 'app-wake-window-widget',
  standalone: true,
  imports: [DatePipe, DurationPipe, OfficialReferenceComponent],
  template: `
    @if (store.wakeWindowStatus(); as ww) {
      <section class="card" style="border-left: 5px solid var(--cat-sleep);">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
          <div>
            <span class="badge badge-sleep">
              <span aria-hidden="true">💤</span>
              <span>TEMPO ACORDADA E ROTINA DO SONO (CADERNETA DA CRIANÇA, PÁG. 17, 41 E 42)</span>
            </span>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin-top: 0.4rem;">
              Acordada há: <span class="mono-timer">{{ timer.awakeMinutes() | duration }}</span>
              <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);">
                (Intervalo de referência: {{ ww.minWindowMinutes | duration }} – {{ ww.maxWindowMinutes | duration }})
              </span>
            </h2>
          </div>

          <div>
            @if (ww.alertLevel === 'Optimal') {
              <span class="badge badge-diaper" style="font-size: 0.88rem; padding: 0.4rem 0.85rem;">
                <span aria-hidden="true">✨</span>
                <span>HORA DE COLOCAR PARA DORMIR</span>
              </span>
            } @else if (ww.alertLevel === 'Overdue') {
              <span class="badge badge-health" style="font-size: 0.88rem; padding: 0.4rem 0.85rem;">
                <span aria-hidden="true">⚠️</span>
                <span>PRECISA DESCANSAR / ACALMAR</span>
              </span>
            } @else {
              <span class="badge badge-sleep" style="font-size: 0.88rem; padding: 0.4rem 0.85rem;">
                <span aria-hidden="true">⏳</span>
                <span>PRÓXIMO SONO EM {{ timer.remainingToSweetSpotMinutes() | duration }}</span>
              </span>
            }
          </div>
        </div>

        <!-- Barra de Progresso Visual do Tempo Acordada -->
        <div style="background: var(--bg-surface-muted); height: 16px; border-radius: 999px; overflow: hidden; border: 1px solid var(--border-subtle); margin: 0.75rem 0;">
          <div
            [style.width.%]="timer.progressPercent()"
            [style.background]="ww.alertLevel === 'Overdue' ? 'var(--cat-health)' : ww.alertLevel === 'Optimal' ? 'var(--cat-diaper)' : 'var(--cat-sleep)'"
            style="height: 100%; transition: width 0.4s ease;">
          </div>
        </div>

        <div class="grid-2" style="margin-top: 0.75rem; font-size: 0.9rem;">
          <div class="card-elevated">
            <div style="color: var(--text-secondary); font-size: 0.8rem; font-weight: 600;">PREVISÃO DO PRÓXIMO SONO NA ROTINA DIÁRIA</div>
            <div style="font-weight: 700; font-size: 1.05rem; margin-top: 0.2rem;">
              🎯 Horário Sugerido: {{ ww.idealSleepTime | date:'HH:mm' }} (Até: {{ ww.maxSleepTime | date:'HH:mm' }})
            </div>
            <div style="color: var(--text-muted); font-size: 0.82rem; margin-top: 0.2rem;">{{ ww.stageDescription }}</div>
          </div>

          <div class="card-elevated">
            <div style="color: var(--text-secondary); font-size: 0.8rem; font-weight: 600;">AMBIENTE E CUIDADOS NO SONO (PÁG. 17 E 41)</div>
            <div style="font-weight: 600; margin-top: 0.2rem;">
              Lugar tranquilo, arejado e limpo • De barriga para cima, boca e nariz descobertos, sem travesseiro e cobertor • Dia: normalmente iluminado e barulho normal; Noite: escuro e silencioso.
            </div>
          </div>
        </div>

        <app-official-reference page="Caderneta da Criança, p. 17: o sono do bebê; p. 41: rotina das mamadas, do banho e de brincar; p. 42: rotina diária de dormir, comer e brincar" />
      </section>
    }
  `
})
export class WakeWindowWidgetComponent {
  readonly store = inject(RoutineStore);
  readonly timer = inject(WakeWindowTimerService);
}
