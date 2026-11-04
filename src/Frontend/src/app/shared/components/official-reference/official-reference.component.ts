import { Component, Input } from '@angular/core';

/** Referência oficial: Caderneta da Criança — Menina (Passaporte da Cidadania), 5ª edição — Ministério da Saúde, Brasília – DF, 2022. */
export const OFFICIAL_REFERENCE_TITLE =
  'Caderneta da Criança (5ª ed. MS, 2022)';
export const OFFICIAL_REFERENCE_URL =
  'https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_crianca_menina_5.ed.pdf';

@Component({
  selector: 'app-official-reference',
  standalone: true,
  template: `
    <div class="official-reference">
      <span aria-hidden="true">📚</span>
      <a [href]="url" target="_blank" rel="noopener noreferrer">{{ title }}</a>
      @if (page) {
        <span>• {{ page }}</span>
      }
    </div>
  `,
  styles: [`
    .official-reference {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.6rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .official-reference a {
      color: var(--cat-sleep);
      font-weight: 700;
      text-decoration: none;
    }

    .official-reference a:hover {
      text-decoration: underline;
    }
  `]
})
export class OfficialReferenceComponent {
  readonly title = OFFICIAL_REFERENCE_TITLE;
  readonly url = OFFICIAL_REFERENCE_URL;

  /** Páginas/seções da Caderneta que fundamentam o texto (ex.: "Caderneta da Criança, p. 24"). */
  @Input() page = '';
}
