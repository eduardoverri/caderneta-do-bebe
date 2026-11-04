import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutineStore } from '../../../../core/state/routine.store';
import { PopupAlertService } from '../../../../core/services/popup-alert.service';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-solids-plate-selector',
  standalone: true,
  imports: [FormsModule, OfficialReferenceComponent],
  template: `
    <div class="card" style="border-top: 4px solid var(--cat-feeding);">
      <h3 class="section-title">
        <span aria-hidden="true">🍲</span>
        <span>Esquema Alimentar e Grupos de Alimentos (Crianças até 2 Anos — pág. 31 a 34)</span>
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Aos 6 meses a criança já pode receber outros alimentos in natura ou minimamente processados além do leite materno (mantido até os 2 anos ou mais). No almoço e no jantar: 1 alimento do grupo dos cereais ou raízes e tubérculos; 1 do grupo dos feijões; 1 ou mais do grupo dos legumes e verduras; e 1 do grupo das carnes e ovos, podendo ser dado junto um pedaço pequeno de fruta. Não ofereça açúcar nem alimentos ultraprocessados à criança de até 2 anos.
      </p>

      <div class="grid-3" style="margin-bottom: 1rem;">
        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Refeição (Quadro 1 — pág. 31)</label>
          <select class="input-field" [(ngModel)]="mealType">
            <option value="Breakfast">Café da manhã (Leite materno; 1–2 anos: fruta ou cereal ou raízes/tubérculos)</option>
            <option value="MorningSnack">Lanche da manhã (Fruta e leite materno)</option>
            <option value="Lunch">Almoço (Cereais/Tubérculos + Feijões + Legumes/Verduras + Carnes/Ovos + Fruta)</option>
            <option value="AfternoonSnack">Lanche da tarde (Fruta e leite materno; 1–2 anos: ou cereal/tubérculos)</option>
            <option value="Dinner">Jantar (Aos 6m: leite materno; a partir de 7m: igual ao almoço)</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Aceitação (pág. 33)</label>
          <select class="input-field" [(ngModel)]="acceptanceLevel">
            <option value="High">Alta (Aceitou bem a refeição)</option>
            <option value="Medium">Média (Atenção aos sinais de fome e saciedade — Passo 9)</option>
            <option value="Low">Baixa (Variar a forma de preparo ajuda a aceitação — pág. 33)</option>
            <option value="Refused">Recusa (Oferecer novamente; podem ser necessárias 8 a 10 tentativas — pág. 33)</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.82rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Consistência e Forma de Oferta (pág. 33 e 34)</label>
          <select class="input-field" [(ngModel)]="eatingAutonomy">
            <option value="PureeSpoon">Comida amassada com garfo / Incentivo ao uso de talheres (Passo 4 — pág. 33 e 34)</option>
            <option value="BLW_Assisted">Comer alguns alimentos com as mãos + incentivo aos talheres (pág. 33)</option>
            <option value="FamilyTable">Mesma comida da família e refeições juntas à mesa sem TV/celular (Passo 7 e 8 — pág. 33 e 34)</option>
          </select>
        </div>
      </div>

      <!-- Os 4 Grupos Principais do Almoço/Jantar (Quadro 1 e Quadro 2 — pág. 31 e 32) -->
      <div class="grid-2" style="margin-bottom: 1rem;">
        <!-- Grupo 1: Grupo dos legumes e verduras + Grupo das frutas -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.4rem;">🥦 1. Grupo dos Legumes e Verduras / Grupo das Frutas</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            @for (item of vegOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
                [class.btn-diaper]="selectedVeg().includes(item)"
                (click)="toggleItem(selectedVeg, vegOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-diaper]="vegOtherActive()"
              (click)="toggleOther(selectedVeg, vegOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-sleep]="selectedVeg().includes('Nenhum')"
              (click)="selectNone(selectedVeg, vegOtherActive, vegOtherText)">
              Nenhum
            </button>
          </div>
          @if (vegOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.55rem;"
              [ngModel]="vegOtherText()"
              (ngModelChange)="vegOtherText.set($event)"
              placeholder="Ex.: beterraba, couve, mamão, banana, laranja, maçã..." />
          }
        </div>

        <!-- Grupo 2: Grupo dos cereais + Grupo das raízes e tubérculos -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.4rem;">🥔 2. Grupo dos Cereais ou Raízes e Tubérculos</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            @for (item of cerealOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
                [class.btn-milestone]="selectedCereals().includes(item)"
                (click)="toggleItem(selectedCereals, cerealOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-milestone]="cerealOtherActive()"
              (click)="toggleOther(selectedCereals, cerealOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-sleep]="selectedCereals().includes('Nenhum')"
              (click)="selectNone(selectedCereals, cerealOtherActive, cerealOtherText)">
              Nenhum
            </button>
          </div>
          @if (cerealOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.55rem;"
              [ngModel]="cerealOtherText()"
              (ngModelChange)="cerealOtherText.set($event)"
              placeholder="Ex.: batata-baroa (mandioquinha), cará, macarrão, cuscuz..." />
          }
        </div>

        <!-- Grupo 3: Grupo dos feijões (leguminosas) -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.4rem;">🫘 3. Grupo dos Feijões (Leguminosas)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            @for (item of legumeOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
                [class.btn-feeding]="selectedLegumes().includes(item)"
                (click)="toggleItem(selectedLegumes, legumeOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-feeding]="legumeOtherActive()"
              (click)="toggleOther(selectedLegumes, legumeOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-sleep]="selectedLegumes().includes('Nenhum')"
              (click)="selectNone(selectedLegumes, legumeOtherActive, legumeOtherText)">
              Nenhum
            </button>
          </div>
          @if (legumeOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.55rem;"
              [ngModel]="legumeOtherText()"
              (ngModelChange)="legumeOtherText.set($event)"
              placeholder="Ex.: feijão-preto, feijão-de-corda, soja..." />
          }
        </div>

        <!-- Grupo 4: Grupo das carnes e ovos -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.4rem;">🥩 4. Grupo das Carnes e Ovos</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            @for (item of proteinOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
                [class.btn-health]="selectedProteins().includes(item)"
                (click)="toggleItem(selectedProteins, proteinOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-health]="proteinOtherActive()"
              (click)="toggleOther(selectedProteins, proteinOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.35rem 0.65rem; min-height: 34px; font-size: 0.82rem;"
              [class.btn-sleep]="selectedProteins().includes('Nenhum')"
              (click)="selectNone(selectedProteins, proteinOtherActive, proteinOtherText)">
              Nenhum
            </button>
          </div>
          @if (proteinOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.55rem;"
              [ngModel]="proteinOtherText()"
              (ngModelChange)="proteinOtherText.set($event)"
              placeholder="Ex.: carne suína, cabrito, cordeiro, miúdos/moela..." />
          }
        </div>
      </div>

      <div class="card-elevated" style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
        <strong>Quantidade aproximada no almoço/jantar (Quadro 1 — pág. 31):</strong>
        Aos 6 meses: 2 a 3 colheres de sopa no total (jantar aos 6m: leite materno) •
        Entre 7 e 8 meses: 3 a 4 colheres de sopa no total •
        Entre 9 e 12 meses: 4 a 5 colheres de sopa no total •
        Entre 1 e 2 anos: 5 a 6 colheres de sopa no total.
      </div>

      <button type="button" class="btn btn-feeding" style="width: 100%;" (click)="savePlate()">
        <span aria-hidden="true">🍽️</span>
        <span>Registrar Refeição da Criança</span>
      </button>

      <app-official-reference page="Caderneta da Criança, p. 31: Quadro 1 – Esquema alimentar para crianças até 2 anos; p. 32: Quadro 2 – Grupos de alimentos; p. 33 e 34: Doze Passos" />
    </div>
  `
})
export class SolidsPlateSelectorComponent {
  readonly store = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  mealType = 'Lunch';
  acceptanceLevel = 'High';
  eatingAutonomy = 'PureeSpoon';

  readonly vegOptions = ['Abóbora (jerimum)', 'Brócolis', 'Cenoura', 'Abobrinha', 'Espinafre', 'Chuchu', 'Banana', 'Mamão'];
  readonly cerealOptions = ['Arroz', 'Batata-doce', 'Mandioca (aipim/macaxeira)', 'Inhame', 'Aveia', 'Milho / Fubá'];
  readonly legumeOptions = ['Feijão carioca', 'Lentilha', 'Grão-de-bico', 'Ervilha'];
  readonly proteinOptions = ['Carne de boi', 'Aves (Frango)', 'Ovos de galinha', 'Pescados (Peixe)', 'Vísceras / Fígado'];

  readonly selectedVeg = signal<string[]>([]);
  readonly selectedCereals = signal<string[]>([]);
  readonly selectedLegumes = signal<string[]>([]);
  readonly selectedProteins = signal<string[]>([]);

  readonly vegOtherActive = signal<boolean>(false);
  readonly vegOtherText = signal<string>('');
  readonly cerealOtherActive = signal<boolean>(false);
  readonly cerealOtherText = signal<string>('');
  readonly legumeOtherActive = signal<boolean>(false);
  readonly legumeOtherText = signal<string>('');
  readonly proteinOtherActive = signal<boolean>(false);
  readonly proteinOtherText = signal<string>('');

  toggleItem(
    targetSignal: ReturnType<typeof signal<string[]>>,
    _otherActiveSignal: ReturnType<typeof signal<boolean>>,
    item: string
  ): void {
    const current = targetSignal().filter(i => i !== 'Nenhum');
    if (current.includes(item)) {
      targetSignal.set(current.filter(i => i !== item));
    } else {
      targetSignal.set([...current, item]);
    }
  }

  toggleOther(
    targetSignal: ReturnType<typeof signal<string[]>>,
    otherActiveSignal: ReturnType<typeof signal<boolean>>
  ): void {
    const next = !otherActiveSignal();
    otherActiveSignal.set(next);
    if (next) {
      targetSignal.set(targetSignal().filter(i => i !== 'Nenhum'));
    }
  }

  selectNone(
    targetSignal: ReturnType<typeof signal<string[]>>,
    otherActiveSignal: ReturnType<typeof signal<boolean>>,
    otherTextSignal: ReturnType<typeof signal<string>>
  ): void {
    if (targetSignal().includes('Nenhum')) {
      targetSignal.set([]);
    } else {
      otherActiveSignal.set(false);
      otherTextSignal.set('');
      targetSignal.set(['Nenhum']);
    }
  }

  private buildGroupList(
    selected: string[],
    otherActive: boolean,
    otherText: string
  ): string[] {
    const list = [...selected];
    const custom = otherText.trim();
    if (otherActive && custom) {
      list.push(`Outros: ${custom}`);
    } else if (otherActive && !custom) {
      list.push('Outros');
    }
    return list;
  }

  async savePlate(): Promise<void> {
    if (
      (this.vegOtherActive() && !this.vegOtherText().trim()) ||
      (this.cerealOtherActive() && !this.cerealOtherText().trim()) ||
      (this.legumeOtherActive() && !this.legumeOtherText().trim()) ||
      (this.proteinOtherActive() && !this.proteinOtherText().trim())
    ) {
      this.popupAlert.incompleteForm(
        'Preencha a descrição do campo "Outros" nos grupos alimentares selecionados.'
      );
      return;
    }

    const fruitsAndVegetables = this.buildGroupList(
      this.selectedVeg(),
      this.vegOtherActive(),
      this.vegOtherText()
    );
    const cerealsAndTubers = this.buildGroupList(
      this.selectedCereals(),
      this.cerealOtherActive(),
      this.cerealOtherText()
    );
    const legumes = this.buildGroupList(
      this.selectedLegumes(),
      this.legumeOtherActive(),
      this.legumeOtherText()
    );
    const animalProtein = this.buildGroupList(
      this.selectedProteins(),
      this.proteinOtherActive(),
      this.proteinOtherText()
    );

    if (
      fruitsAndVegetables.length === 0 ||
      cerealsAndTubers.length === 0 ||
      legumes.length === 0 ||
      animalProtein.length === 0
    ) {
      this.popupAlert.incompleteForm(
        'Selecione pelo menos um item ou a opção "Nenhum" em cada um dos quatro grupos de alimentos.'
      );
      return;
    }

    const allergens: string[] = [];
    for (const p of animalProtein) {
      if (p.includes('Ovo')) allergens.push('Ovos de galinha');
      if (p.includes('Peixe') || p.includes('Pescados')) allergens.push('Pescados');
    }
    for (const c of cerealsAndTubers) {
      if (c.includes('Aveia') || c.includes('Trigo')) allergens.push('Aveia / Trigo');
    }

    await this.store.logSolidsPlate({
      mealType: this.mealType,
      fruitsAndVegetables,
      cerealsAndTubers,
      legumes,
      animalProtein,
      acceptanceLevel: this.acceptanceLevel,
      eatingAutonomy: this.eatingAutonomy,
      allergensPresented: allergens
    });
  }
}
