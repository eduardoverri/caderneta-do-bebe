import { Component, Input } from '@angular/core';

/** Referência oficial: Caderneta da Criança — Menina (Passaporte da Cidadania), 5ª edição — Ministério da Saúde, Brasília – DF, 2022. */
export const OFFICIAL_REFERENCE_TITLE =
  'Caderneta da Criança: Passaporte da Cidadania — 5ª edição (Ministério da Saúde, 2022)';
export const OFFICIAL_REFERENCE_URL =
  'https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_crianca_menina_5.ed.pdf';

@Component({
  selector: 'app-official-reference',
  standalone: true,
  template: `
    <p class="official-reference">
      <span aria-hidden="true">📚</span>
      <span>
        Referência:
        <a [href]="url" target="_blank" rel="noopener noreferrer">{{ title }}</a>
        @if (page) {
          <span> ({{ page }})</span>
        }
      </span>
    </p>
  `,
  styles: [`
    .official-reference {
      display: flex;
      align-items: flex-start;
      gap: 0.4rem;
      margin-top: 0.75rem;
      font-size: 0.74rem;
      color: var(--text-muted);
      overflow-wrap: anywhere;
    }

    .official-reference a {
      color: var(--cat-sleep);
      font-weight: 600;
    }
  `]
})
export class OfficialReferenceComponent {
  readonly title = OFFICIAL_REFERENCE_TITLE;
  readonly url = OFFICIAL_REFERENCE_URL;

  /** Páginas/seções da Caderneta que fundamentam o texto (ex.: "Caderneta da Criança, p. 24"). */
  @Input() page = '';
}
