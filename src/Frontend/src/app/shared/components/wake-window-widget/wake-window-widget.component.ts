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
        <!-- Linha Principal de Status e Previsão de Sono -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="badge badge-sleep">💤 JANELA DE VIGÍLIA</span>
              <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">
                Ref.: {{ ww.minWindowMinutes | duration }} – {{ ww.maxWindowMinutes | duration }}
              </span>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin-top: 0.25rem;">
              Acordada há <span class="mono-timer">{{ timer.awakeMinutes() | duration }}</span>
            </h2>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <div class="card-elevated" style="padding: 0.45rem 0.75rem;">
              <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700;">PRÓXIMO SONO SUGERIDO</div>
              <div class="mono-timer" style="font-weight: 800; font-size: 0.98rem;">
                🎯 {{ ww.idealSleepTime | date:'HH:mm' }} <span style="font-weight: 500; font-size: 0.8rem; color: var(--text-muted);">(máx. {{ ww.maxSleepTime | date:'HH:mm' }})</span>
              </div>
            </div>

            @if (ww.alertLevel === 'Optimal') {
              <span class="badge badge-diaper" style="font-size: 0.84rem; padding: 0.4rem 0.8rem;">
                ✨ HORA DE DORMIR
              </span>
            } @else if (ww.alertLevel === 'Overdue') {
              <span class="badge badge-health" style="font-size: 0.84rem; padding: 0.4rem 0.8rem;">
                ⚠️ PRECISA DESCANSAR
              </span>
            } @else {
              <span class="badge badge-sleep" style="font-size: 0.84rem; padding: 0.4rem 0.8rem;">
                ⏳ Em {{ timer.remainingToSweetSpotMinutes() | duration }}
              </span>
            }
          </div>
        </div>

        <!-- Barra de Progresso Visual do Tempo Acordada -->
        <div style="background: var(--bg-surface-muted); height: 12px; border-radius: 999px; overflow: hidden; border: 1px solid var(--border-subtle); margin: 0.65rem 0 0.25rem;">
          <div
            [style.width.%]="timer.progressPercent()"
            [style.background]="ww.alertLevel === 'Overdue' ? 'var(--cat-health)' : ww.alertLevel === 'Optimal' ? 'var(--cat-diaper)' : 'var(--cat-sleep)'"
            style="height: 100%; transition: width 0.4s ease;">
          </div>
        </div>

        <!-- Conteúdo Informativo Recolhido sob Demanda -->
        <details class="info-disclosure">
          <summary>💡 Orientações de Ambiente e Sono Seguro (Caderneta, pág. 17, 41 e 42)</summary>
          <div class="info-disclosure-body">
            <p style="margin-bottom: 0.35rem;"><strong>{{ ww.stageDescription }}</strong></p>
            <p>
              Lugar tranquilo, arejado e limpo • De barriga para cima, boca e nariz descobertos, sem travesseiro e cobertor •
              Dia: normalmente iluminado e barulho normal; Noite: escuro e silencioso.
            </p>
            <app-official-reference page="p. 17, 41 e 42" />
          </div>
        </details>
      </section>
    }
  `
})
export class WakeWindowWidgetComponent {
  readonly store = inject(RoutineStore);
  readonly timer = inject(WakeWindowTimerService);
}
