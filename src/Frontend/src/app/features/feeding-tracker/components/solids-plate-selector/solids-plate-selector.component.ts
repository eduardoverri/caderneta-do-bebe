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
        <span>Registrar Refeição Sólida (4 Grupos Alimentares)</span>
      </h3>

      <div class="grid-3" style="margin-bottom: 0.85rem;">
        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Refeição</label>
          <select class="input-field" [(ngModel)]="mealType">
            <option value="Breakfast">Café da manhã</option>
            <option value="MorningSnack">Lanche da manhã (Fruta)</option>
            <option value="Lunch">Almoço (4 Grupos)</option>
            <option value="AfternoonSnack">Lanche da tarde (Fruta)</option>
            <option value="Dinner">Jantar (4 Grupos)</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Aceitação</label>
          <select class="input-field" [(ngModel)]="acceptanceLevel">
            <option value="High">Alta (Aceitou bem)</option>
            <option value="Medium">Média</option>
            <option value="Low">Baixa</option>
            <option value="Refused">Recusou (Reoferecer em 8–10 tentativas)</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Consistência / Forma</label>
          <select class="input-field" [(ngModel)]="eatingAutonomy">
            <option value="PureeSpoon">Amassada com garfo / colher</option>
            <option value="BLW_Assisted">Em pedaços com as mãos + talheres</option>
            <option value="FamilyTable">Mesma comida da família à mesa</option>
          </select>
        </div>
      </div>

      <!-- Os 4 Grupos Principais do Almoço/Jantar -->
      <div class="grid-2" style="margin-bottom: 0.85rem;">
        <!-- Grupo 1 -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.35rem;">🥦 1. Legumes, Verduras e Frutas</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            @for (item of vegOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
                [class.btn-diaper]="selectedVeg().includes(item)"
                (click)="toggleItem(selectedVeg, vegOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-diaper]="vegOtherActive()"
              (click)="toggleOther(selectedVeg, vegOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-sleep]="selectedVeg().includes('Nenhum')"
              (click)="selectNone(selectedVeg, vegOtherActive, vegOtherText)">
              Nenhum
            </button>
          </div>
          @if (vegOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.45rem;"
              [ngModel]="vegOtherText()"
              (ngModelChange)="vegOtherText.set($event)"
              placeholder="Ex.: beterraba, couve, maçã..." />
          }
        </div>

        <!-- Grupo 2 -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.35rem;">🥔 2. Cereais, Raízes e Tubérculos</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            @for (item of cerealOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
                [class.btn-milestone]="selectedCereals().includes(item)"
                (click)="toggleItem(selectedCereals, cerealOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-milestone]="cerealOtherActive()"
              (click)="toggleOther(selectedCereals, cerealOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-sleep]="selectedCereals().includes('Nenhum')"
              (click)="selectNone(selectedCereals, cerealOtherActive, cerealOtherText)">
              Nenhum
            </button>
          </div>
          @if (cerealOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.45rem;"
              [ngModel]="cerealOtherText()"
              (ngModelChange)="cerealOtherText.set($event)"
              placeholder="Ex.: mandioquinha, macarrão..." />
          }
        </div>

        <!-- Grupo 3 -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.35rem;">🫘 3. Feijões (Leguminosas)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            @for (item of legumeOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
                [class.btn-feeding]="selectedLegumes().includes(item)"
                (click)="toggleItem(selectedLegumes, legumeOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-feeding]="legumeOtherActive()"
              (click)="toggleOther(selectedLegumes, legumeOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-sleep]="selectedLegumes().includes('Nenhum')"
              (click)="selectNone(selectedLegumes, legumeOtherActive, legumeOtherText)">
              Nenhum
            </button>
          </div>
          @if (legumeOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.45rem;"
              [ngModel]="legumeOtherText()"
              (ngModelChange)="legumeOtherText.set($event)"
              placeholder="Ex.: feijão-preto, soja..." />
          }
        </div>

        <!-- Grupo 4 -->
        <div class="card-elevated">
          <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.35rem;">🥩 4. Carnes e Ovos</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            @for (item of proteinOptions; track item) {
              <button
                type="button"
                class="btn"
                style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
                [class.btn-health]="selectedProteins().includes(item)"
                (click)="toggleItem(selectedProteins, proteinOtherActive, item)">
                {{ item }}
              </button>
            }
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-health]="proteinOtherActive()"
              (click)="toggleOther(selectedProteins, proteinOtherActive)">
              Outros
            </button>
            <button
              type="button"
              class="btn"
              style="padding: 0.25rem 0.55rem; min-height: 32px; font-size: 0.78rem;"
              [class.btn-sleep]="selectedProteins().includes('Nenhum')"
              (click)="selectNone(selectedProteins, proteinOtherActive, proteinOtherText)">
              Nenhum
            </button>
          </div>
          @if (proteinOtherActive()) {
            <input
              type="text"
              class="input-field"
              style="margin-top: 0.45rem;"
              [ngModel]="proteinOtherText()"
              (ngModelChange)="proteinOtherText.set($event)"
              placeholder="Ex.: carne suína, miúdos..." />
          }
        </div>
      </div>

      <button type="button" class="btn btn-feeding" style="width: 100%;" (click)="savePlate()">
        <span aria-hidden="true">🍽️</span>
        <span>Salvar Refeição da Criança</span>
      </button>

      <details class="info-disclosure">
        <summary>💡 Esquema Alimentar e Quantidades por Idade (Quadro 1 — pág. 31 a 34)</summary>
        <div class="info-disclosure-body">
          <ul>
            <li><strong>6 meses:</strong> 2 a 3 colheres de sopa no almoço (jantar aos 6m ainda é leite materno).</li>
            <li><strong>7 a 8 meses:</strong> 3 a 4 colheres de sopa no almoço e no jantar.</li>
            <li><strong>9 a 12 meses:</strong> 4 a 5 colheres de sopa • <strong>1 a 2 anos:</strong> 5 a 6 colheres de sopa.</li>
            <li>Zero açúcar e zero ultraprocessados antes dos 2 anos de idade.</li>
          </ul>
          <app-official-reference page="p. 31 a 34" />
        </div>
      </details>
    </div>
  `
})
export class SolidsPlateSelectorComponent {
  readonly store = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  mealType = 'Lunch';
  acceptanceLevel = 'High';
  eatingAutonomy = 'PureeSpoon';

  readonly vegOptions = ['Abóbora', 'Brócolis', 'Cenoura', 'Abobrinha', 'Espinafre', 'Chuchu', 'Banana', 'Mamão'];
  readonly cerealOptions = ['Arroz', 'Batata-doce', 'Mandioca', 'Inhame', 'Aveia', 'Milho / Fubá'];
  readonly legumeOptions = ['Feijão carioca', 'Lentilha', 'Grão-de-bico', 'Ervilha'];
  readonly proteinOptions = ['Carne de boi', 'Frango', 'Ovos', 'Peixe', 'Fígado'];

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
