import { Component, inject } from '@angular/core';
import { RoutineStore } from '../../../../core/state/routine.store';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-transition-readiness-chart',
  standalone: true,
  imports: [OfficialReferenceComponent],
  template: `
    @if (store.napTransition(); as tr) {
      <div class="card">
        <h3 class="section-title">
          <span aria-hidden="true">📊</span>
          <span>Organização da Rotina Diária de Dormir, Comer e Brincar (pág. 16 a 19, 41 e 42)</span>
        </h3>

        <div class="card-elevated" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700;">ORGANIZAÇÃO ATUAL DA ROTINA DE SONO</div>
              <div style="font-size: 1.1rem; font-weight: 800; margin-top: 0.15rem;">{{ tr.targetTransition }}</div>
            </div>
            <span class="badge" [class]="tr.isTransitionRecommended ? 'badge-milestone' : 'badge-sleep'">
              <span aria-hidden="true">{{ tr.isTransitionRecommended ? '🔔' : '🛡️' }}</span>
              <span>{{ tr.daysWithResistanceLast10Days }} / {{ tr.requiredConsecutiveDaysThreshold }} dias com dificuldade no sono</span>
            </span>
          </div>
          <p style="margin-top: 0.6rem; font-size: 0.9rem; color: var(--text-secondary);">
            {{ tr.clinicalRecommendation }}
          </p>
        </div>

        <div class="card-elevated" style="font-size: 0.85rem;">
          <div style="font-weight: 700; margin-bottom: 0.35rem;">🔍 Orientações oficiais sobre rotina, sono, choro e acolhimento (Caderneta da Criança)</div>
          <ul style="padding-left: 1.2rem; color: var(--text-secondary);">
            <li><strong>Recém-nascido (pág. 16, 17 e 24):</strong> O bebê recém-nascido dorme muito. Inicialmente, o bebê que se alimenta apenas de leite materno mama de 8 a 12 vezes por dia e, com o tempo, ela mesmo vai aumentando os intervalos e fazendo o seu próprio horário de mamadas. Não é necessário fixar horários.</li>
            <li><strong>Entre 2 e 4 meses (pág. 41):</strong> No início parece muito difícil, mas procure ir criando uma rotina das mamadas, do banho, de brincar no tempo que ela está acordada. Isso facilita a regulação das funções fisiológicas do bebê.</li>
            <li><strong>Entre 6 e 9 meses (pág. 42):</strong> O bebê já consegue dormir, comer e brincar em uma rotina mais organizada, de acordo com o ritmo da família. A manutenção de uma rotina diária dá segurança à criança e ajuda no seu aprendizado da organização e da disciplina, o que será importante para toda a sua vida.</li>
            <li><strong>O choro do bebê (pág. 16 e 38):</strong> O choro é um comportamento normal para os bebês, é uma das maneiras que eles têm de se expressar. Ela chora de um jeito diferente, dependendo do que sente: fome, frio, calor, dor ou necessidade de aconchego. Na maioria das vezes, eles se acalmam quando aconchegados ao colo ou colocados no peito. Não se preocupe, bebês não ficam viciados em colo. Evite deixar sua filha chorando sozinha.</li>
            <li><strong>Idade corrigida (pág. 19 e 89):</strong> Chamamos de pré-termo os bebês que nascem com menos de 37 semanas de idade gestacional. Para saber como estimular seu bebê e avaliar o seu desenvolvimento, você precisa corrigir a sua idade: basta diminuir da idade atual o tempo que faltou para ele completar 9 meses (ou 40 semanas de idade gestacional).</li>
            <li><strong>Atenção (pág. 53, 58 e 66):</strong> Quando os dentes de leite estão nascendo (por volta dos 6 meses), a criança pode apresentar alteração do sono (pág. 58). Dificuldade com o sono também é um sinal de alerta do desenvolvimento (pág. 53) e o distúrbio do sono pode indicar que a criança sofre violência (pág. 66).</li>
          </ul>
          <app-official-reference page="Caderneta da Criança, p. 16 e 17: choro e sono; p. 19 e 89: idade corrigida; p. 24: livre demanda; p. 38, 41 e 42: rotina; p. 53, 58 e 66: alterações do sono" />
        </div>
      </div>
    }
  `
})
export class TransitionReadinessChartComponent {
  readonly store = inject(RoutineStore);
}
