import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-stool-visual-picker',
  standalone: true,
  template: `
    <div class="card-elevated" style="margin-bottom: 1rem;">
      <div style="font-weight: 700; font-size: 0.88rem; margin-bottom: 0.5rem;">
        3. ESCALA DE CORES DAS FEZES &amp; SINAIS DE PERIGO (CADERNETA DA CRIANÇA, PÁG. 18 E 23)
      </div>
      <div class="grid-3" style="margin-bottom: 1rem;">
        @for (c of colors; track c.value) {
          <button
            type="button"
            class="btn"
            [class.btn-health]="c.isAlert && selectedColor === c.value"
            [class.btn-diaper]="!c.isAlert && selectedColor === c.value"
            (click)="selectColor.emit(c.value)">
            <span aria-hidden="true">{{ c.icon }}</span>
            <span>{{ c.label }}</span>
          </button>
        }
      </div>

      <div style="font-weight: 700; font-size: 0.88rem; margin-bottom: 0.5rem;">
        4. ASPECTO E FUNCIONAMENTO DO INTESTINO (PÁG. 18, 21 E 71–73)
      </div>
      <div class="grid-3">
        @for (cons of consistencies; track cons.value) {
          <button
            type="button"
            class="btn"
            [class.btn-diaper]="selectedConsistency === cons.value"
            (click)="selectConsistency.emit(cons.value)">
            <span>{{ cons.label }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class StoolVisualPickerComponent {
  @Input() selectedColor = 'Mustard';
  @Input() selectedConsistency = 'LiquidPastous';
  @Output() readonly selectColor = new EventEmitter<string>();
  @Output() readonly selectConsistency = new EventEmitter<string>();

  readonly colors = [
    { value: 'Mustard', label: 'Amarelada (Fezes normais 1 a 5 — pág. 18)', icon: '🟡', isAlert: false },
    { value: 'BrownishGreen', label: 'Esverdeada / Amarronzada (Fezes normais 1 a 5 — pág. 18)', icon: '🟢', isAlert: false },
    { value: 'WhiteGrey', label: 'Quase branca / Cinzenta (Fezes suspeitas 6 a 8 — Urgência ⚠️)', icon: '⚪', isAlert: true },
    { value: 'Black', label: 'Escura (Normal nos primeiros dias; fora disso, avaliar ⚠️)', icon: '⚫', isAlert: true },
    { value: 'RedBlood', label: 'Fezes com sangue (Sinal de Perigo — pág. 23 ⚠️)', icon: '🔴', isAlert: true }
  ];

  readonly consistencies = [
    { value: 'LiquidPastous', label: 'Líquida / Pastosa (Normal no peito; se muito líquida/vômitos: SRO)' },
    { value: 'MoldedPastous', label: 'Pastosa / Formada (Alimentação complementar)' },
    { value: 'Hardened', label: 'Constipação / Esforço para fazer cocô (Avaliar estado geral — pág. 18)' }
  ];
}
