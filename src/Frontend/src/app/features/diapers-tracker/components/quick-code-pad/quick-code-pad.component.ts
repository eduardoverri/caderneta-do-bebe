import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quick-code-pad',
  standalone: true,
  template: `
    <div class="card-elevated" style="margin-bottom: 1rem;">
      <div style="font-weight: 700; font-size: 0.84rem; margin-bottom: 0.5rem;">
        1. ESTADO DA FRALDA
      </div>
      <div class="grid-4" style="margin-bottom: 1rem;">
        @for (st of states; track st.code) {
          <button
            type="button"
            class="btn"
            [class.btn-diaper]="selectedState === st.code"
            (click)="selectState.emit(st.code)">
            <span aria-hidden="true">{{ st.icon }}</span>
            <span>{{ st.code }} - {{ st.label }}</span>
          </button>
        }
      </div>

      <div style="font-weight: 700; font-size: 0.84rem; margin-bottom: 0.5rem;">
        2. VOLUME DE URINA / EVACUAÇÃO
      </div>
      <div class="grid-3">
        @for (vol of volumes; track vol.level) {
          <button
            type="button"
            class="btn"
            [class.btn-diaper]="selectedVolume === vol.level"
            (click)="selectVolume.emit(vol.level)">
            <span>{{ vol.level }} - {{ vol.label }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class QuickCodePadComponent {
  @Input() selectedState = 'M';
  @Input() selectedVolume = 2;
  @Output() readonly selectState = new EventEmitter<string>();
  @Output() readonly selectVolume = new EventEmitter<number>();

  readonly states = [
    { code: 'L', label: 'Limpa', icon: '✨' },
    { code: 'U', label: 'Urina (Xixi)', icon: '💧' },
    { code: 'E', label: 'Evacuação (Cocô)', icon: '💩' },
    { code: 'M', label: 'Mista (Xixi + Cocô)', icon: '🧷' }
  ];

  readonly volumes = [
    { level: 1, label: 'Pouco ⚠️' },
    { level: 2, label: 'Médio (Habitual)' },
    { level: 3, label: 'Cheia' }
  ];
}
