import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RoutineEventModel, RoutineStore } from '../../core/state/routine.store';
import { BreastTimerComponent } from './components/breast-timer/breast-timer.component';
import { SolidsPlateSelectorComponent } from './components/solids-plate-selector/solids-plate-selector.component';
import { AllergenMonitorComponent } from './components/allergen-monitor/allergen-monitor.component';
import { HungerCuesGuideComponent } from './components/hunger-cues-guide/hunger-cues-guide.component';

@Component({
  selector: 'app-feeding-tracker',
  standalone: true,
  imports: [
    DatePipe,
    BreastTimerComponent,
    SolidsPlateSelectorComponent,
    AllergenMonitorComponent,
    HungerCuesGuideComponent
  ],
  template: `
    <!-- Seletor de Modo: separa Ação de Registro, Alérgenos, Histórico e Guia dos 12 Passos -->
    <div class="segmented-bar" role="tablist" aria-label="Modos de Alimentação">
      <button type="button" class="segmented-btn" [class.active]="activeMode() === 'BREAST_MILK'" (click)="activeMode.set('BREAST_MILK')">
        <span>🤱</span>
        <span>Amamentação &amp; Leite (mL)</span>
      </button>
      <button type="button" class="segmented-btn" [class.active]="activeMode() === 'SOLIDS'" (click)="activeMode.set('SOLIDS')">
        <span>🍲</span>
        <span>Refeição Sólida (Prato)</span>
      </button>
      <button type="button" class="segmented-btn" [class.active]="activeMode() === 'ALLERGENS'" (click)="activeMode.set('ALLERGENS')">
        <span>🥜</span>
        <span>Alérgenos ({{ store.allergenTrials().length }})</span>
      </button>
      <button type="button" class="segmented-btn" [class.active]="activeMode() === 'HISTORY'" (click)="activeMode.set('HISTORY')">
        <span>📋</span>
        <span>Registros ({{ feedingEvents().length }}) &amp; Guia</span>
      </button>
    </div>

    @switch (activeMode()) {
      @case ('BREAST_MILK') {
        <app-breast-timer />
      }
      @case ('SOLIDS') {
        <app-solids-plate-selector />
      }
      @case ('ALLERGENS') {
        <app-allergen-monitor />
      }
      @case ('HISTORY') {
        <!-- Lista das Últimas Refeições e Mamadas -->
        <section class="card" style="border-top: 4px solid var(--cat-feeding); margin-bottom: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <h3 class="section-title" style="margin-bottom: 0;">
              <span aria-hidden="true">🍽️</span>
              <span>Histórico de Mamadas e Refeições Registradas</span>
            </h3>
            <span class="badge badge-feeding">{{ feedingEvents().length }} registro(s)</span>
          </div>

          @if (feedingEvents().length === 0) {
            <div class="card-elevated" style="text-align: center; padding: 1.1rem; color: var(--text-secondary); font-size: 0.85rem;">
              Nenhuma refeição ou mamada registrada ainda para esta criança.
            </div>
          } @else {
            <div style="display: flex; flex-direction: column; gap: 0.55rem;">
              @for (ev of feedingEvents(); track ev.id) {
                <div class="card-elevated" style="border-left: 4px solid var(--cat-feeding);">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div style="font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
                      <span aria-hidden="true">{{ getFeedingIcon(ev) }}</span>
                      <span>{{ getFeedingTitle(ev) }}</span>
                    </div>
                    <span class="mono-timer" style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">
                      {{ ev.timestamp | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>

                  @if (ev.details.feedingType === 'Solids' && ev.details.solidsDetails; as solids) {
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.3rem; display: flex; flex-direction: column; gap: 0.15rem;">
                      <div>
                        <strong>Aceitação:</strong> {{ formatAcceptance(solids.acceptanceLevel) }} •
                        <strong>Forma:</strong> {{ formatAutonomy(solids.eatingAutonomy) }}
                      </div>
                      @if (solids.foodGroups.fruitsAndVegetables.length > 0) {
                        <div>🥦 <strong>Legumes/Frutas:</strong> {{ solids.foodGroups.fruitsAndVegetables.join(', ') }}</div>
                      }
                      @if (solids.foodGroups.cerealsAndTubers.length > 0) {
                        <div>🥔 <strong>Cereais/Tubérculos:</strong> {{ solids.foodGroups.cerealsAndTubers.join(', ') }}</div>
                      }
                      @if (solids.foodGroups.legumes.length > 0) {
                        <div>🫘 <strong>Feijões:</strong> {{ solids.foodGroups.legumes.join(', ') }}</div>
                      }
                      @if (solids.foodGroups.animalProtein.length > 0) {
                        <div>🥩 <strong>Carnes/Ovos:</strong> {{ solids.foodGroups.animalProtein.join(', ') }}</div>
                      }
                    </div>
                  } @else if (ev.details.feedingType === 'Breast' && ev.details.breastfeedingDetails) {
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
                      Esquerda: <strong>{{ formatSec(ev.details.breastfeedingDetails.leftDurationSeconds) }}</strong> •
                      Direita: <strong>{{ formatSec(ev.details.breastfeedingDetails.rightDurationSeconds) }}</strong> •
                      Última mama: <strong>{{ ev.details.breastfeedingDetails.lastSideOffered === 'Left' ? 'Esquerda' : 'Direita' }}</strong>
                    </div>
                  } @else if (ev.details.feedingType === 'Formula' || ev.details.feedingType === 'ExpressedMilk') {
                    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">
                      Volume ingerido: <strong>{{ ev.details.formulaVolumeMl ?? 0 }} mL</strong>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </section>

        <app-hunger-cues-guide />
      }
    }
  `
})
export class FeedingTrackerComponent {
  readonly store = inject(RoutineStore);
  readonly activeMode = signal<'BREAST_MILK' | 'SOLIDS' | 'ALLERGENS' | 'HISTORY'>('BREAST_MILK');

  readonly feedingEvents = computed<RoutineEventModel[]>(() =>
    this.store.events().filter(e => e.category === 'Feeding')
  );

  getFeedingIcon(ev: RoutineEventModel): string {
    switch (ev.details.feedingType) {
      case 'Breast':
        return '🤱';
      case 'Formula':
      case 'ExpressedMilk':
        return '🥛';
      case 'Solids':
        return '🍲';
      default:
        return '🍽️';
    }
  }

  getFeedingTitle(ev: RoutineEventModel): string {
    switch (ev.details.feedingType) {
      case 'Breast':
        return `Leite Materno no Peito (${ev.durationMinutes ?? 1} min)`;
      case 'Formula':
        return `Leite Artificial (${ev.details.formulaVolumeMl ?? 0} mL)`;
      case 'ExpressedMilk':
        return `Leite Materno Extraído (${ev.details.formulaVolumeMl ?? 0} mL)`;
      case 'Solids':
        return `Alimentação Complementar • ${this.formatMealType(ev.details.solidsDetails?.mealType)}`;
      default:
        return 'Refeição / Alimentação';
    }
  }

  formatMealType(mealType?: string): string {
    switch (mealType) {
      case 'Breakfast':
        return 'Café da manhã';
      case 'MorningSnack':
        return 'Lanche da manhã';
      case 'Lunch':
        return 'Almoço';
      case 'AfternoonSnack':
        return 'Lanche da tarde';
      case 'Dinner':
        return 'Jantar';
      default:
        return mealType ?? 'Refeição';
    }
  }

  formatAcceptance(level?: string): string {
    switch (level) {
      case 'High':
        return 'Alta';
      case 'Medium':
        return 'Média';
      case 'Low':
        return 'Baixa';
      case 'Refused':
        return 'Recusou';
      default:
        return level ?? '-';
    }
  }

  formatAutonomy(autonomy?: string): string {
    switch (autonomy) {
      case 'BLW_Assisted':
        return 'Mãos + incentivo aos talheres';
      case 'PureeSpoon':
        return 'Amassada / talheres';
      case 'FamilyTable':
        return 'Comida da família à mesa';
      default:
        return autonomy ?? '-';
    }
  }

  formatSec(sec: number): string {
    const m = Math.floor((sec || 0) / 60);
    const s = (sec || 0) % 60;
    return `${m}m ${s}s`;
  }
}
