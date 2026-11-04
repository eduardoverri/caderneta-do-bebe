import { Component } from '@angular/core';
import { OfficialReferenceComponent } from '../../../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-hunger-cues-guide',
  standalone: true,
  imports: [OfficialReferenceComponent],
  template: `
    <details class="section-accordion">
      <summary>📖 Guia Oficial: 12 Passos para uma Alimentação Adequada e Saudável (p. 33–35)</summary>
      <div class="accordion-body">
        <div class="grid-3">
          <div class="card-elevated" style="border-left: 4px solid var(--cat-diaper);">
            <div style="font-weight: 800; color: var(--cat-diaper);">🤱 Passos 1 a 4 — Leite Materno e In Natura</div>
            <ul style="padding-left: 1.15rem; font-size: 0.84rem; margin-top: 0.4rem; color: var(--text-secondary);">
              <li><strong>PASSO 1.</strong> Amamentar até os 2 anos ou mais, oferecendo somente leite materno até os 6 meses.</li>
              <li><strong>PASSO 2.</strong> Oferecer alimentos in natura ou minimamente processados, além do leite materno a partir dos 6 meses.</li>
              <li><strong>PASSO 3.</strong> Oferecer água própria para o consumo em vez de sucos, refrigerantes e outras bebidas açucaradas.</li>
              <li><strong>PASSO 4.</strong> Oferecer a comida amassada quando a criança começar a comer outros alimentos além do leite materno.</li>
            </ul>
          </div>

          <div class="card-elevated" style="border-left: 4px solid var(--cat-milestone);">
            <div style="font-weight: 800; color: var(--cat-milestone);">🍲 Passos 5 a 8 — Sem Açúcar e Ultraprocessados</div>
            <ul style="padding-left: 1.15rem; font-size: 0.84rem; margin-top: 0.4rem; color: var(--text-secondary);">
              <li><strong>PASSO 5.</strong> Não oferecer açúcar nem preparações ou produtos que contenham açúcar à criança de até 2 anos de idade.</li>
              <li><strong>PASSO 6.</strong> Não oferecer alimentos ultraprocessados (achocolatado, refrigerantes, sucos de caixa, salgadinhos, gelatina, balas, biscoitos, bolachas, macarrão instantâneo e salsicha).</li>
              <li><strong>PASSO 7.</strong> Cozinhar a mesma comida para a criança e para a família.</li>
              <li><strong>PASSO 8.</strong> Zelar para que a hora da alimentação da criança seja um momento de experiências positivas, aprendizado e afeto junto da família.</li>
            </ul>
          </div>

          <div class="card-elevated" style="border-left: 4px solid var(--cat-health);">
            <div style="font-weight: 800; color: var(--cat-health);">💛 Passos 9 a 12 — Sinais de Fome e Proteção</div>
            <ul style="padding-left: 1.15rem; font-size: 0.84rem; margin-top: 0.4rem; color: var(--text-secondary);">
              <li><strong>PASSO 9.</strong> Prestar atenção aos sinais de fome e de saciedade da criança e conversar com ela durante a refeição.</li>
              <li><strong>PASSO 10.</strong> Cuidar da higiene em todas as etapas da alimentação da criança e da família.</li>
              <li><strong>PASSO 11.</strong> Oferecer alimentação adequada e saudável também fora de casa.</li>
              <li><strong>PASSO 12.</strong> Proteger a criança da publicidade dos alimentos.</li>
            </ul>
          </div>
        </div>

        <div class="card-elevated" style="margin-top: 0.85rem; font-size: 0.85rem;">
          <strong>🍽️ Orientações na hora da refeição (pág. 33):</strong>
          As crianças gostam de comer alguns alimentos com as mãos. Permita que sua filha faça isso algumas vezes, mas não deixe de incentivá-la a usar os talheres. Ensine-a a lavar as mãos antes das refeições e a criar o hábito de escovar os dentes logo depois. Evite ligar a televisão ou mexer no celular nesses momentos.
        </div>

        <app-official-reference page="Caderneta da Criança, p. 33–35" />
      </div>
    </details>
  `
})
export class HungerCuesGuideComponent {}
