import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutineStore } from '../../core/state/routine.store';
import { QuickCodePadComponent } from './components/quick-code-pad/quick-code-pad.component';
import { StoolVisualPickerComponent } from './components/stool-visual-picker/stool-visual-picker.component';
import { OfficialReferenceComponent } from '../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-diapers-tracker',
  standalone: true,
  imports: [FormsModule, QuickCodePadComponent, StoolVisualPickerComponent, OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-diaper);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
        <div>
          <h3 class="section-title" style="margin-bottom: 0.15rem;">
            <span aria-hidden="true">🧷</span>
            <span>A Troca de Fraldas, As Fezes e Prevenção da Desidratação</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Código Selecionado: <strong class="mono-timer" style="font-size: 1.05rem;">{{ state }}{{ volume }}</strong>
            • {{ store.hydrationStatusMessage() }}
          </p>
        </div>
        <span class="badge badge-diaper">
          {{ store.totalDiaperChanges() }} trocas registradas hoje
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

      <div class="card-elevated" style="margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 1.25rem; align-items: center;">
        <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer;">
          <input type="checkbox" [(ngModel)]="barrierCreamApplied" style="width: 18px; height: 18px;" />
          <span>✅ Limpeza preferencialmente com água e proteção contra assaduras (Não use talco — pág. 18 e 61)</span>
        </label>

        <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer;">
          <input type="checkbox" [(ngModel)]="hasBlood" style="width: 18px; height: 18px;" />
          <span>⚠️ Fezes com sangue (Sinal de Perigo — pág. 23)</span>
        </label>
      </div>

      <button type="button" class="btn btn-diaper" style="width: 100%; font-size: 1rem;" (click)="saveDiaper()">
        <span aria-hidden="true">💾</span>
        <span>SALVAR FRALDA ({{ state }}{{ volume }}) — 1 TOQUE</span>
      </button>

      <div class="card-elevated" style="margin-top: 1rem; font-size: 0.85rem;">
        <div style="font-weight: 700; margin-bottom: 0.35rem;">🧷 Orientações oficiais — A troca de fraldas, as fezes e a desidratação</div>
        <ul style="padding-left: 1.2rem; color: var(--text-secondary);">
          <li><strong>A troca de fraldas:</strong> As assaduras são muito dolorosas para o bebê. Procure trocar as fraldas sempre que estiverem molhadas ou sujas. Limpe o bebê preferencialmente com água. Não use talco. Antes e depois da troca, lave suas mãos com água e sabão, se não for possível, use álcool em gel. A vermelhidão nas áreas cobertas pela fralda pode ser assadura ou alergia. Procure orientação do profissional de saúde sobre os cuidados.</li>
          <li><strong>As fezes:</strong> Observe as fezes de sua filha. A quantidade de vezes que a criança faz cocô varia muito: ela pode fazer várias vezes ao dia (especialmente após as mamadas) ou ficar até dois ou três dias sem fazer cocô, ou mais, se estiver mamando só no peito. Nos primeiros dias de vida, as fezes costumam ser escuras, tornando-se amareladas durante a primeira semana. Também podem ser líquidas e, às vezes, esverdeadas. Se a criança estiver bem, se não apresentar nenhum outro sintoma, isso não é diarreia.</li>
          <li><strong>Alerta urgente (Escala de cores das fezes):</strong> Fezes excessivamente claras, que não escurecem, permanecendo quase brancas ou cinzentas, podem significar alguma doença que precisa ser investigada e descoberta cedo. Nesses casos, procure o serviço de saúde <strong>com urgência</strong>. É primordial e salvador de vidas investigar e descartar a atresia de vias biliares precocemente. É mais importante observar o estado geral da sua filha e o esforço dela para fazer cocô, antes de pensar que há algo anormal.</li>
          <li><strong>São sinais de desidratação:</strong> Estar com os olhos fundos • Sentir muita sede • Chorar sem lágrimas • Ter pouca saliva • Urinar pouco • Pele com pouca elasticidade. Se isso acontecer, leve sua filha ao serviço de saúde. Se ela estiver vomitando e suas fezes estiverem muito líquidas, ofereça o soro de <strong>reidratação oral</strong>, mesmo antes de chegar ao serviço de saúde.</li>
        </ul>
        <app-official-reference page="Caderneta da Criança, p. 18: a troca de fraldas e as fezes; p. 20 a 22: diarreia e desidratação; p. 23: sinais de perigo" />
      </div>
    </div>
  `
})
export class DiapersTrackerComponent {
  readonly store = inject(RoutineStore);

  state = 'M';
  volume = 2;
  stoolColor = 'Mustard';
  stoolConsistency = 'MoldedPastous';
  barrierCreamApplied = true;
  hasBlood = false;

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
