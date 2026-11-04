import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  AddressChangeRecord,
  AgendaEntryRecord,
  BabyStore,
  CadernetaNoteRecord,
  ChildIdentification,
  DentalRecord,
  NeonatalScreeningRecord,
  PrenatalBirthRecord,
  RoutineConsultationRecord,
  SchoolLifeRecord,
  SocialAssistanceRecord,
  SupplementationRecord
} from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { OfficialReferenceComponent } from '../../shared/components/official-reference/official-reference.component';

type CadernetaSectionTab =
  | 'identificacao'
  | 'prenatal'
  | 'consultas'
  | 'odonto_supl'
  | 'guias';

@Component({
  selector: 'app-caderneta-hub',
  standalone: true,
  imports: [FormsModule, DatePipe, OfficialReferenceComponent],
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- Cabeçalho Oficial da Caderneta da Criança -->
      <section class="card" style="border-left: 5px solid var(--cat-sleep);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 class="section-title" style="margin-bottom: 0.15rem;">
              <span aria-hidden="true">📘</span>
              <span>Caderneta da Criança — Passaporte da Cidadania (5ª Edição)</span>
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">
              Prontuário integral de <strong>{{ babyStore.activeBaby().name }}</strong> dividido em módulos recolhíveis para leitura limpa.
            </p>
          </div>
          <app-official-reference page="Caderneta da Criança (5ª ed., 2022), Parte I (p. 4–66) e Parte II (p. 68–108)" />
        </div>

        <!-- Sub-navegação interna da Caderneta -->
        <div class="segmented-bar" style="margin-top: 0.85rem; margin-bottom: 0;">
          <button type="button" class="segmented-btn" [class.active]="subTab() === 'identificacao'" (click)="subTab.set('identificacao')">
            🪪 1. Identificação &amp; Social
          </button>
          <button type="button" class="segmented-btn" [class.active]="subTab() === 'prenatal'" (click)="subTab.set('prenatal')">
            🤰 2. Pré-Natal, Parto &amp; Triagens
          </button>
          <button type="button" class="segmented-btn" [class.active]="subTab() === 'consultas'" (click)="subTab.set('consultas')">
            🩺 3. 10 Consultas &amp; Agenda
          </button>
          <button type="button" class="segmented-btn" [class.active]="subTab() === 'odonto_supl'" (click)="subTab.set('odonto_supl')">
            🦷 4. Odonto &amp; Suplementos
          </button>
          <button type="button" class="segmented-btn" [class.active]="subTab() === 'guias'" (click)="subTab.set('guias')">
            📚 5. Guias Ilustrados
          </button>
        </div>
      </section>

      <!-- =========================================================================
           ABA 1: IDENTIFICAÇÃO (p. 4), MUDANÇAS DE ENDEREÇO (p. 5), ASSISTÊNCIA SOCIAL (p. 6-7), ESCOLA (p. 8-9) & DIREITOS (p. 10-13)
           ========================================================================= -->
      @if (subTab() === 'identificacao') {
        <details class="section-accordion" name="caderneta-tab-1" open>
          <summary>🪪 Identificação da Criança (Página 4)</summary>
          <div class="accordion-body">
            <div class="grid-3" style="gap: 0.75rem;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nome completo da criança</label>
                <input type="text" [(ngModel)]="babyName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Data de nascimento</label>
                <input type="date" [(ngModel)]="babyBirthDate" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Município de nascimento</label>
                <input type="text" [(ngModel)]="identification.birthMunicipality" placeholder="Ex.: São Paulo - SP" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nome da mãe</label>
                <input type="text" [(ngModel)]="identification.motherName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nome do pai</label>
                <input type="text" [(ngModel)]="identification.fatherName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nome do responsável</label>
                <input type="text" [(ngModel)]="identification.guardianName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Raça / Cor</label>
                <select [(ngModel)]="identification.raceColor">
                  <option value="Branca">Branca</option>
                  <option value="Preta">Preta</option>
                  <option value="Parda">Parda</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Indígena">Indígena</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Etnia (povos indígenas)</label>
                <input type="text" [(ngModel)]="identification.ethnicity" placeholder="Se aplicável" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Tipo Sanguíneo</label>
                <input type="text" [(ngModel)]="babyBloodType" placeholder="Ex.: O+" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Cartão Nacional de Saúde (CNS)</label>
                <input type="text" [(ngModel)]="identification.cnsNumber" placeholder="15 dígitos do Cartão SUS" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nº Declaração de Nascido Vivo (DNV)</label>
                <input type="text" [(ngModel)]="identification.dnvNumber" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nº Registro Civil de Nascimento (RCN)</label>
                <input type="text" [(ngModel)]="identification.birthCertificateNumber" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Número do CPF da criança</label>
                <input type="text" [(ngModel)]="identification.cpf" placeholder="000.000.000-00" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Endereço residencial</label>
                <input type="text" [(ngModel)]="identification.address" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Ponto de referência</label>
                <input type="text" [(ngModel)]="identification.referencePoint" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Telefone</label>
                <input type="text" [(ngModel)]="identification.phone" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">CEP</label>
                <input type="text" [(ngModel)]="identification.cep" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Bairro / Localidade</label>
                <input type="text" [(ngModel)]="identification.neighborhood" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Cidade</label>
                <input type="text" [(ngModel)]="identification.city" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Estado (UF)</label>
                <input type="text" [(ngModel)]="identification.state" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Unidade Básica de Saúde (UBS) que frequenta</label>
                <input type="text" [(ngModel)]="identification.ubsName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">DSEI / Polo-Base de Saúde Indígena</label>
                <input type="text" [(ngModel)]="identification.dseiPoloBase" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Pediatra / Profissional de Referência</label>
                <input type="text" [(ngModel)]="pediatricianName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">CRM / Registro Profissional</label>
                <input type="text" [(ngModel)]="pediatricianCrm" />
              </div>
            </div>
            <div style="margin-top: 0.85rem;">
              <button type="button" class="btn btn-primary" (click)="saveIdentificationAndSocial()">
                💾 Salvar Identificação da Criança (p. 4)
              </button>
            </div>
          </div>
        </details>

        <!-- Página 5: Mudanças de Endereço -->
        <details class="section-accordion" name="caderneta-tab-1">
          <summary>🏠 Mudanças de Endereço e UBS (Página 5) • {{ addressHistory.length }} registro(s)</summary>
          <div class="accordion-body">
            <div class="grid-3" style="gap: 0.65rem;">
              <input type="text" [(ngModel)]="newAddress.address" placeholder="Novo Endereço" />
              <input type="text" [(ngModel)]="newAddress.referencePoint" placeholder="Ponto de referência" />
              <input type="text" [(ngModel)]="newAddress.phone" placeholder="Telefone" />
              <input type="text" [(ngModel)]="newAddress.cep" placeholder="CEP" />
              <input type="text" [(ngModel)]="newAddress.neighborhood" placeholder="Bairro/localidade" />
              <input type="text" [(ngModel)]="newAddress.city" placeholder="Cidade / UF" />
              <input type="text" [(ngModel)]="newAddress.ubsName" placeholder="UBS que passa a frequentar" />
              <button type="button" class="btn btn-primary" (click)="addAddressChange()">+ Registrar Mudança de Endereço</button>
            </div>

            @if (addressHistory.length > 0) {
              <div style="margin-top: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
                @for (addr of addressHistory; track addr.id) {
                  <div style="padding: 0.65rem; border: 1px solid var(--border-subtle); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                    <div style="font-size: 0.84rem;">
                      <strong>{{ addr.address }}</strong> ({{ addr.neighborhood }} • {{ addr.city }} • CEP {{ addr.cep }})
                      <div style="color: var(--text-secondary);">Ref.: {{ addr.referencePoint || '-' }} • Tel.: {{ addr.phone || '-' }} • UBS: <strong>{{ addr.ubsName || '-' }}</strong></div>
                    </div>
                    <button type="button" class="btn" style="font-size: 0.75rem;" (click)="removeAddressChange(addr.id)">🗑️ Remover</button>
                  </div>
                }
              </div>
            }
          </div>
        </details>

        <!-- Páginas 6 e 7: Dados da Assistência Social -->
        <details class="section-accordion" name="caderneta-tab-1">
          <summary>🤝 Dados da Assistência Social e Programas Sociais (Páginas 6 e 7)</summary>
          <div class="accordion-body">
            <div class="grid-3" style="gap: 0.75rem;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">NIS da Criança</label>
                <input type="text" [(ngModel)]="socialAssistance.childNis" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">NIS do Responsável Familiar</label>
                <input type="text" [(ngModel)]="socialAssistance.guardianNis" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nome do CRAS de Referência</label>
                <input type="text" [(ngModel)]="socialAssistance.crasName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Telefone do CRAS</label>
                <input type="text" [(ngModel)]="socialAssistance.crasPhone" />
              </div>
              <div style="grid-column: span 2;">
                <label style="font-size: 0.78rem; font-weight: 600;">Endereço do CRAS</label>
                <input type="text" [(ngModel)]="socialAssistance.crasAddress" />
              </div>
            </div>

            <div class="grid-3" style="gap: 0.75rem; margin-top: 0.85rem;">
              <div style="padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem;">
                  <input type="checkbox" [(ngModel)]="socialAssistance.bolsaFamiliaEnrolled" style="width: auto;" />
                  Beneficiária do Programa Bolsa Família
                </label>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                  <input type="text" [(ngModel)]="socialAssistance.bolsaFamiliaEntryYear" placeholder="Ano ingresso" />
                  <input type="text" [(ngModel)]="socialAssistance.bolsaFamiliaExitYear" placeholder="Ano deslig." />
                </div>
              </div>

              <div style="padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem;">
                  <input type="checkbox" [(ngModel)]="socialAssistance.bpcEnrolled" style="width: auto;" />
                  Beneficiária do BPC (Prestação Continuada)
                </label>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                  <input type="text" [(ngModel)]="socialAssistance.bpcEntryYear" placeholder="Ano ingresso" />
                  <input type="text" [(ngModel)]="socialAssistance.bpcExitYear" placeholder="Ano deslig." />
                </div>
              </div>

              <div style="padding: 0.75rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem;">
                  <input type="checkbox" [(ngModel)]="socialAssistance.criancaFelizEnrolled" style="width: auto;" />
                  Participante do Programa Criança Feliz
                </label>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                  <input type="text" [(ngModel)]="socialAssistance.criancaFelizEntryYear" placeholder="Ano ingresso" />
                  <input type="text" [(ngModel)]="socialAssistance.criancaFelizExitYear" placeholder="Ano deslig." />
                </div>
              </div>
            </div>

            <div style="margin-top: 0.85rem;">
              <h4 style="font-size: 0.88rem; margin-bottom: 0.4rem;">📝 Anotações da Assistência Social (Página 7)</h4>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <input type="text" [(ngModel)]="newSocialNoteText" placeholder="Nova anotação socioassistencial..." style="flex: 2;" />
                <input type="text" [(ngModel)]="newSocialNoteAuthor" placeholder="Profissional / CRAS" style="flex: 1;" />
                <button type="button" class="btn" (click)="addSocialNote()">+ Adicionar Anotação</button>
              </div>
              @for (sn of socialAssistance.socialNotes; track sn.id) {
                <div style="margin-top: 0.4rem; padding: 0.5rem; background: var(--bg-soft); border-radius: 8px; display: flex; justify-content: space-between; font-size: 0.83rem;">
                  <span><strong>{{ sn.date | date:'dd/MM/yyyy' }}:</strong> {{ sn.note }} ({{ sn.professionalOrCras }})</span>
                  <button type="button" class="btn" style="padding: 0.15rem 0.45rem; font-size: 0.72rem;" (click)="removeSocialNote(sn.id)">🗑️</button>
                </div>
              }
            </div>

            <div style="margin-top: 0.85rem;">
              <button type="button" class="btn btn-primary" (click)="saveIdentificationAndSocial()">
                💾 Salvar Assistência Social (p. 6 e 7)
              </button>
            </div>
          </div>
        </details>

        <!-- Páginas 8 e 9: Educação e Vida Escolar -->
        <details class="section-accordion" name="caderneta-tab-1">
          <summary>🏫 Anotações sobre a Educação e Vida Escolar (Páginas 8 e 9) • {{ educationRecords.length }} registro(s)</summary>
          <div class="accordion-body">
            <div class="grid-3" style="gap: 0.65rem;">
              <input type="text" [(ngModel)]="newSchool.year" placeholder="Ano (Ex: 2026)" />
              <input type="text" [(ngModel)]="newSchool.gradeType" placeholder="Tipo/grau (Creche / Pré-escola / Fundamental)" />
              <input type="text" [(ngModel)]="newSchool.series" placeholder="Série / Turma" />
              <input type="text" [(ngModel)]="newSchool.establishmentName" placeholder="Nome do estabelecimento de ensino" />
              <select [(ngModel)]="newSchool.institutionNature">
                <option value="Pública">Pública</option>
                <option value="Privada">Privada</option>
                <option value="Religiosa">Religiosa / Filantrópica</option>
              </select>
              <input type="text" [(ngModel)]="newSchool.observations" placeholder="Observações pedagógicas" />
            </div>
            <div style="margin-top: 0.65rem;">
              <button type="button" class="btn btn-primary" (click)="addSchoolRecord()">+ Registrar Vida Escolar</button>
            </div>

            @if (educationRecords.length > 0) {
              <div style="overflow-x: auto; margin-top: 0.85rem;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                  <thead>
                    <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                      <th style="padding: 0.5rem;">Ano</th>
                      <th style="padding: 0.5rem;">Tipo/Grau</th>
                      <th style="padding: 0.5rem;">Série</th>
                      <th style="padding: 0.5rem;">Estabelecimento</th>
                      <th style="padding: 0.5rem;">Natureza</th>
                      <th style="padding: 0.5rem;">Observações</th>
                      <th style="padding: 0.5rem;">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (ed of educationRecords; track ed.id) {
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 0.5rem; font-weight: 700;">{{ ed.year }}</td>
                        <td style="padding: 0.5rem;">{{ ed.gradeType }}</td>
                        <td style="padding: 0.5rem;">{{ ed.series }}</td>
                        <td style="padding: 0.5rem;">{{ ed.establishmentName }}</td>
                        <td style="padding: 0.5rem;">{{ ed.institutionNature }}</td>
                        <td style="padding: 0.5rem;">{{ ed.observations }}</td>
                        <td style="padding: 0.5rem;">
                          <button type="button" class="btn" style="padding: 0.2rem 0.45rem; font-size: 0.72rem;" (click)="removeSchoolRecord(ed.id)">🗑️</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </details>

        <!-- Páginas 10 a 13: Os Direitos da Criança e dos Pais -->
        <details class="info-disclosure">
          <summary>⚖️ Os Direitos da Criança e dos Pais (Páginas 10 a 13 — ECA Lei nº 8.069/1990)</summary>
          <div class="disclosure-body">
            <div class="grid-2" style="gap: 0.85rem; font-size: 0.84rem;">
              <div style="padding: 0.75rem; background: var(--bg-card); border-radius: 10px;">
                <strong>Direitos dos Pais / Responsáveis (p. 10–11):</strong>
                <ul style="margin: 0.4rem 0 0 1.1rem; line-height: 1.5;">
                  <li>Atendimento pré-natal, parto humanizado e acompanhante de livre escolha da gestante no pré-parto, parto e pós-parto (Lei nº 11.108/2005).</li>
                  <li>Licença-maternidade de 120 dias (ou até 180 dias na Empresa Cidadã / serviço público) e estabilidade desde a confirmação da gravidez até 5 meses após o parto.</li>
                  <li>Dois descansos diários de 30 minutos para amamentação até os 6 meses de idade.</li>
                  <li>Licença-paternidade de 5 dias corridos (ou 20 dias na Empresa Cidadã) e até 2 dias para acompanhar consultas/exames na gestação.</li>
                  <li>Direito a permanecer em tempo integral ao lado da criança em caso de internação hospitalar (ECA, art. 12).</li>
                </ul>
              </div>
              <div style="padding: 0.75rem; background: var(--bg-card); border-radius: 10px;">
                <strong>Direitos Fundamentais da Criança (p. 11–13):</strong>
                <ul style="margin: 0.4rem 0 0 1.1rem; line-height: 1.5;">
                  <li><strong>Registro Civil de Nascimento (RCN) gratuito:</strong> Primeiro documento de cidadania (Lei nº 9.534/1997).</li>
                  <li>Ser chamada pelo nome desde o nascimento, receber atenção integral pelo SUS, vacinação gratuita e ser amamentada.</li>
                  <li>Acesso gratuito à creche (0 a 3 anos) e pré-escola (4 a 5 anos) próximo à residência.</li>
                  <li>Brincar, aprender, conviver em família/comunidade e viver livre de qualquer forma de negligência, discriminação ou violência.</li>
                  <li>Benefício de Prestação Continuada (BPC/LOAS): 1 salário mínimo mensal para crianças com deficiência de famílias com renda per capita &lt; 1/4 do salário mínimo.</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      }

      <!-- =========================================================================
           ABA 2: PRÉ-NATAL, PARTO, NASCIMENTO, ALTA (p. 69) E TRIAGENS NEONATAIS (p. 70-71)
           ========================================================================= -->
      @if (subTab() === 'prenatal') {
        <details class="section-accordion" name="caderneta-tab-2" open>
          <summary>🤰 Dados sobre Gravidez, Pré-Natal, Parto, Nascimento e Alta (Página 69)</summary>
          <div class="accordion-body">
            <div class="grid-3" style="gap: 0.75rem;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Gravidez planejada?</label>
                <select [(ngModel)]="prenatalAndBirth.plannedPregnancy">
                  <option [ngValue]="true">Sim</option>
                  <option [ngValue]="false">Não</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Fez pré-natal? Nº de consultas</label>
                <input type="number" [(ngModel)]="prenatalAndBirth.prenatalConsultationsCount" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Iniciou o pré-natal em qual trimestre?</label>
                <select [(ngModel)]="prenatalAndBirth.startedTrimester">
                  <option value="1º">1º Trimestre</option>
                  <option value="2º">2º Trimestre</option>
                  <option value="3º">3º Trimestre</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Tipo de gravidez</label>
                <select [(ngModel)]="prenatalAndBirth.pregnancyType">
                  <option value="Única">Única</option>
                  <option value="Múltipla">Múltipla</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Gravidez de risco? Qual motivo?</label>
                <input type="text" [(ngModel)]="prenatalAndBirth.highRiskReason" placeholder="Em branco se habitual" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Vacinas na gestação (dTpa / Influenza / HepB / Covid-19)</label>
                <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; margin-top: 0.35rem; font-size: 0.8rem;">
                  <label><input type="checkbox" [(ngModel)]="prenatalAndBirth.vaccineDtpa" style="width:auto;" /> dTpa</label>
                  <label><input type="checkbox" [(ngModel)]="prenatalAndBirth.vaccineInfluenza" style="width:auto;" /> Influenza</label>
                  <label><input type="checkbox" [(ngModel)]="prenatalAndBirth.vaccineHepatitisB" style="width:auto;" /> Hepatite B</label>
                  <label><input type="checkbox" [(ngModel)]="prenatalAndBirth.vaccineCovid19" style="width:auto;" /> Covid-19</label>
                </div>
              </div>
            </div>

            <!-- Sorologias no pré-natal (A53, B18, B58, Zika) -->
            <div style="margin-top: 0.9rem;">
              <h4 style="font-size: 0.88rem; margin-bottom: 0.4rem;">🧪 Sorologias Realizadas no Pré-Natal (NR = Não realizado | N = Normal | ALT = Alterado)</h4>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
                  <thead>
                    <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                      <th style="padding: 0.45rem;">Agravo / Código CID-10</th>
                      <th style="padding: 0.45rem;">1º Trimestre</th>
                      <th style="padding: 0.45rem;">2º Trimestre</th>
                      <th style="padding: 0.45rem;">3º Trimestre</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (s of prenatalAndBirth.serologies; track s.cid10Code) {
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 0.45rem; font-weight: 700;">{{ s.conditionName }}</td>
                        <td style="padding: 0.45rem;">
                          <select [(ngModel)]="s.trimester1"><option value="N">N (Normal)</option><option value="NR">NR (Não realizado)</option><option value="ALT">ALT (Alterado)</option></select>
                        </td>
                        <td style="padding: 0.45rem;">
                          <select [(ngModel)]="s.trimester2"><option value="N">N (Normal)</option><option value="NR">NR (Não realizado)</option><option value="ALT">ALT (Alterado)</option></select>
                        </td>
                        <td style="padding: 0.45rem;">
                          <select [(ngModel)]="s.trimester3"><option value="N">N (Normal)</option><option value="NR">NR (Não realizado)</option><option value="ALT">ALT (Alterado)</option></select>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Parto e Nascimento -->
            <h4 style="font-size: 0.9rem; margin: 1rem 0 0.5rem;">👶 Parto, Nascimento e Internação Neonatal (Página 69)</h4>
            <div class="grid-3" style="gap: 0.75rem;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Parto realizado em</label>
                <select [(ngModel)]="prenatalAndBirth.birthPlaceType">
                  <option value="Hospital">Hospital</option>
                  <option value="Centro de Parto Normal">Centro de Parto Normal</option>
                  <option value="Domicílio">Domicílio</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Nome da Maternidade / CPN</label>
                <input type="text" [(ngModel)]="prenatalAndBirth.maternityName" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Tipo de Parto</label>
                <select [(ngModel)]="prenatalAndBirth.deliveryType">
                  <option value="Vaginal">Vaginal</option>
                  <option value="Cesárea">Cesárea</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Hora do nascimento</label>
                <input type="text" [(ngModel)]="prenatalAndBirth.birthTime" placeholder="08:30" />
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Apgar 1º min / 5º min</label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="number" min="0" max="10" [(ngModel)]="prenatalAndBirth.apgar1Min" placeholder="1º min" />
                  <input type="number" min="0" max="10" [(ngModel)]="prenatalAndBirth.apgar5Min" placeholder="5º min" />
                </div>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Adequação Peso/IG (AIG / PIG / GIG)</label>
                <select [(ngModel)]="prenatalAndBirth.weightForGestationalAge">
                  <option value="AIG">AIG (Adequado para IG)</option>
                  <option value="PIG">PIG (Pequeno para IG)</option>
                  <option value="GIG">GIG (Grande para IG)</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Boas práticas ao nascer</label>
                <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; margin-top: 0.25rem;">
                  <label><input type="checkbox" [(ngModel)]="prenatalAndBirth.skinToSkinContact" style="width:auto;" /> Contato pele a pele imediato</label>
                  <label><input type="checkbox" [(ngModel)]="prenatalAndBirth.breastfedFirstHour" style="width:auto;" /> Mamou na 1ª hora de vida</label>
                  <label><input type="checkbox" [(ngModel)]="prenatalAndBirth.timelyCordClamping" style="width:auto;" /> Clampeamento oportuno do cordão</label>
                </div>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Tipo Sanguíneo Mãe / Coombs Indireto</label>
                <div style="display: flex; gap: 0.4rem;">
                  <input type="text" [(ngModel)]="prenatalAndBirth.motherBloodType" placeholder="Mãe" />
                  <input type="text" [(ngModel)]="prenatalAndBirth.indirectCoombs" placeholder="CI" />
                </div>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Tipo Sanguíneo Bebê / Coombs Direto</label>
                <div style="display: flex; gap: 0.4rem;">
                  <input type="text" [(ngModel)]="prenatalAndBirth.babyBloodType" placeholder="Bebê" />
                  <input type="text" [(ngModel)]="prenatalAndBirth.directCoombs" placeholder="CD" />
                </div>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Unidade de Internação / Alta</label>
                <select [(ngModel)]="prenatalAndBirth.hospitalizationUnit">
                  <option value="ALCON">ALCON (Alojamento Conjunto)</option>
                  <option value="Utin">UTIN (UTI Neonatal)</option>
                  <option value="Ucinco">UCINCo (Cuidado Intermediário Convencional)</option>
                  <option value="Ucinca">UCINCa (Cuidado Intermediário Canguru)</option>
                </select>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Peso na alta (g) / Comprimento (cm)</label>
                <div style="display: flex; gap: 0.4rem;">
                  <input type="number" [(ngModel)]="prenatalAndBirth.dischargeWeightGrams" placeholder="Peso (g)" />
                  <input type="number" step="0.1" [(ngModel)]="prenatalAndBirth.dischargeLengthCm" placeholder="Comp (cm)" />
                </div>
              </div>
              <div>
                <label style="font-size: 0.78rem; font-weight: 600;">Alimentação na alta</label>
                <select [(ngModel)]="prenatalAndBirth.dischargeFeeding">
                  <option value="Aleitamento materno exclusivo">Aleitamento materno exclusivo</option>
                  <option value="Aleitamento materno e leite artificial">Aleitamento materno + leite artificial</option>
                  <option value="Leite artificial">Leite artificial</option>
                </select>
              </div>
            </div>
            <div style="margin-top: 0.65rem;">
              <label style="font-size: 0.78rem; font-weight: 600;">Relatório de alta (principais diagnósticos, tratamentos e recomendações)</label>
              <input type="text" [(ngModel)]="prenatalAndBirth.dischargeReport" />
            </div>
            <div style="margin-top: 0.85rem;">
              <button type="button" class="btn btn-primary" (click)="savePrenatalAndScreenings()">
                💾 Salvar Pré-Natal, Parto e Alta (p. 69)
              </button>
            </div>
          </div>
        </details>

        <!-- Páginas 70 e 71: Triagens Neonatais -->
        <details class="section-accordion" name="caderneta-tab-2">
          <summary>🔬 Triagens Neonatais: Olhinho, Coraçãozinho, Orelhinha e Pezinho (Páginas 70 e 71)</summary>
          <div class="accordion-body">
            <div class="grid-2" style="gap: 0.85rem;">
              <!-- Teste do Olhinho -->
              <div style="padding: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                <h4 style="font-size: 0.9rem; margin-bottom: 0.45rem;">👁️ Teste do Reflexo Vermelho (Teste do Olhinho)</h4>
                <div class="grid-2" style="gap: 0.5rem;">
                  <div>
                    <label style="font-size: 0.75rem;">Olho Direito (OD)</label>
                    <select [(ngModel)]="neonatalScreenings.redReflexRightEye">
                      <option value="Normal">Normal</option>
                      <option value="Alterado">Alterado</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size: 0.75rem;">Olho Esquerdo (OE)</label>
                    <select [(ngModel)]="neonatalScreenings.redReflexLeftEye">
                      <option value="Normal">Normal</option>
                      <option value="Alterado">Alterado</option>
                    </select>
                  </div>
                </div>
                <input type="text" style="margin-top: 0.5rem;" [(ngModel)]="neonatalScreenings.redReflexObservations" placeholder="Observações / Encaminhamento oftalmológico" />
              </div>

              <!-- Teste do Coraçãozinho -->
              <div style="padding: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                <h4 style="font-size: 0.9rem; margin-bottom: 0.45rem;">❤️ Teste do Coraçãozinho (Oximetria de Pulso após 24h)</h4>
                <div>
                  <label style="font-size: 0.75rem;">Resultado (Normal: SpO2 ≥95% e diferença &lt;3%)</label>
                  <select [(ngModel)]="neonatalScreenings.pulseOximetryResult">
                    <option value="Normal">Normal (≥95% em ambas as medidas e diferença &lt;3%)</option>
                    <option value="Alterado">Alterado (&lt;95% ou diferença ≥3% — ecocardiograma)</option>
                  </select>
                </div>
                <input type="text" style="margin-top: 0.5rem;" [(ngModel)]="neonatalScreenings.pulseOximetryObservations" placeholder="Saturação aferida MSD / MI e conduta" />
              </div>

              <!-- Teste da Orelhinha -->
              <div style="padding: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                <h4 style="font-size: 0.9rem; margin-bottom: 0.45rem;">👂 Teste da Orelhinha (Triagem Auditiva Neonatal)</h4>
                <div class="grid-3" style="gap: 0.45rem;">
                  <div>
                    <label style="font-size: 0.75rem;">Método</label>
                    <select [(ngModel)]="neonatalScreenings.hearingMethod">
                      <option value="EOA">EOA (Emissões Otoacústicas)</option>
                      <option value="PEATE">PEATE-A (Potencial Evocado)</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size: 0.75rem;">Orelha Direita</label>
                    <select [(ngModel)]="neonatalScreenings.hearingRightEar"><option value="Normal">Normal</option><option value="Alterado">Alterado</option></select>
                  </div>
                  <div>
                    <label style="font-size: 0.75rem;">Orelha Esquerda</label>
                    <select [(ngModel)]="neonatalScreenings.hearingLeftEar"><option value="Normal">Normal</option><option value="Alterado">Alterado</option></select>
                  </div>
                </div>
                <input type="text" style="margin-top: 0.5rem;" [(ngModel)]="neonatalScreenings.hearingConduct" placeholder="Conduta / Reteste" />
              </div>

              <!-- Teste do Pezinho -->
              <div style="padding: 0.85rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                <h4 style="font-size: 0.9rem; margin-bottom: 0.45rem;">🦶 Teste do Pezinho (Triagem Biológica — 3º ao 5º dia)</h4>
                <div class="grid-2" style="gap: 0.45rem;">
                  <div>
                    <label style="font-size: 0.75rem;">Resultado da Triagem</label>
                    <input type="text" [(ngModel)]="neonatalScreenings.heelPrickResult" />
                  </div>
                  <div>
                    <label style="font-size: 0.75rem;">Unidade de Acompanhamento</label>
                    <select [(ngModel)]="neonatalScreenings.heelPrickReferral">
                      <option value="AB">AB (Atenção Básica / UBS)</option>
                      <option value="CER">CER (Centro Especializado em Reabilitação)</option>
                      <option value="SSA">SSA (Serviço de Saúde Auditiva)</option>
                      <option value="SSE">SSE (Serviço Especializado)</option>
                    </select>
                  </div>
                </div>
                <input type="text" style="margin-top: 0.5rem;" [(ngModel)]="neonatalScreenings.heelPrickObservations" placeholder="Fenilcetonúria, Hipotireoidismo, Falciforme, Fibrose Cística, HAC, Biotinidase, Toxoplasmose" />
              </div>
            </div>

            <div style="margin-top: 0.85rem;">
              <button type="button" class="btn btn-primary" (click)="savePrenatalAndScreenings()">
                💾 Salvar Triagens Neonatais (p. 70 e 71)
              </button>
            </div>
          </div>
        </details>
      }

      <!-- =========================================================================
           ABA 3: 10 CONSULTAS RECOMENDADAS (p. 70-76), AGENDA (p. 108) & ANOTAÇÕES GERAIS (p. 107)
           ========================================================================= -->
      @if (subTab() === 'consultas') {
        <details class="section-accordion" name="caderneta-tab-3" open>
          <summary>🩺 As 10 Consultas Recomendadas pelo Ministério da Saúde (Páginas 70 a 76)</summary>
          <div class="accordion-body">
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem;">
              @for (c of consultations; track c.code) {
                <button
                  type="button"
                  class="btn"
                  [class.btn-primary]="selectedConsultationCode() === c.code"
                  (click)="selectConsultation(c.code)"
                  style="font-size: 0.78rem;"
                >
                  {{ c.completed ? '✅' : '⏳' }} {{ c.recommendedAgeLabel }} ({{ c.pageReference }})
                </button>
              }
            </div>

            @if (activeConsultation(); as cons) {
              <div style="padding: 1rem; border: 2px solid var(--border-strong); border-radius: 12px; background: var(--bg-soft);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
                  <h4 style="font-size: 1rem; margin: 0;">{{ cons.title }} — Referência: {{ cons.pageReference }}</h4>
                  <label style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.88rem;">
                    <input type="checkbox" [(ngModel)]="cons.completed" style="width: auto;" />
                    Consulta Realizada
                  </label>
                </div>

                <div class="grid-3" style="gap: 0.65rem;">
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Peso (g)</label>
                    <input type="number" [(ngModel)]="cons.weightGrams" placeholder="Ex: 6500" />
                  </div>
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Comprimento / Estatura (cm)</label>
                    <input type="number" step="0.1" [(ngModel)]="cons.lengthOrHeightCm" placeholder="Ex: 63.5" />
                  </div>
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Perímetro Cefálico (cm)</label>
                    <input type="number" step="0.1" [(ngModel)]="cons.headCircumferenceCm" placeholder="Ex: 41.2" />
                  </div>
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Alimentação da Criança</label>
                    <select [(ngModel)]="cons.feedingType">
                      <option value="Aleitamento materno exclusivo">Aleitamento materno exclusivo</option>
                      <option value="Aleitamento materno complementado">Aleitamento materno complementado</option>
                      <option value="Substituto do leite materno">Substituto do leite materno</option>
                      <option value="Alimentação saudável da família">Alimentação saudável da família</option>
                      <option value="Consome alimentos ultraprocessados">Consome alimentos ultraprocessados</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Vigilância do Desenvolvimento</label>
                    <select [(ngModel)]="cons.developmentEvaluation">
                      <option value="DESENVOLVIMENTO ADEQUADO">DESENVOLVIMENTO ADEQUADO</option>
                      <option value="ALERTA PARA O DESENVOLVIMENTO">ALERTA PARA O DESENVOLVIMENTO</option>
                      <option value="PROVÁVEL ATRASO NO DESENVOLVIMENTO">PROVÁVEL ATRASO NO DESENVOLVIMENTO</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Pressão Arterial (PA) / Exame Ocular</label>
                    <input type="text" [(ngModel)]="cons.ocularExam" />
                  </div>
                </div>

                <!-- Sinais de Alerta específicos da idade -->
                <div style="margin-top: 0.85rem;">
                  <strong style="font-size: 0.84rem;">⚠️ Sinais de Alerta Investigados nesta Consulta:</strong>
                  <div class="grid-2" style="gap: 0.4rem; margin-top: 0.4rem;">
                    @for (al of cons.alertSigns; track al.label) {
                      <label style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.82rem;">
                        <input type="checkbox" [(ngModel)]="al.present" style="width: auto;" />
                        <span>{{ al.label }}</span>
                      </label>
                    }
                  </div>
                </div>

                <!-- Verificações importantes / Cuidados especiais -->
                <div style="margin-top: 0.85rem;">
                  <strong style="font-size: 0.84rem;">✅ Verificações Importantes e Cuidados Especiais:</strong>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.85rem; margin-top: 0.4rem; font-size: 0.82rem;">
                    <label><input type="checkbox" [(ngModel)]="cons.vaccinesChecked" style="width:auto;" /> Vacinas de acordo com o calendário</label>
                    <label><input type="checkbox" [(ngModel)]="cons.ironSupplementationChecked" style="width:auto;" /> Suplementação de Ferro</label>
                    <label><input type="checkbox" [(ngModel)]="cons.micronutrientsChecked" style="width:auto;" /> Outros micronutrientes (NutriSUS)</label>
                    <label><input type="checkbox" [(ngModel)]="cons.vitaminAChecked" style="width:auto;" /> Megadose de Vitamina A</label>
                    <label><input type="checkbox" [(ngModel)]="cons.dentalChecked" style="width:auto;" /> Saúde Bucal / Dentista</label>
                    <label><input type="checkbox" [(ngModel)]="cons.accidentPreventionChecked" style="width:auto;" /> Prevenção de Acidentes</label>
                    <label><input type="checkbox" [(ngModel)]="cons.violenceSignsChecked" style="width:auto;" /> Sinais de Violência/Negligência</label>
                    <label><input type="checkbox" [(ngModel)]="cons.screenTimeChecked" style="width:auto;" /> Orientação sobre Telas/Eletrônicos</label>
                  </div>
                </div>

                <div class="grid-2" style="gap: 0.65rem; margin-top: 0.75rem;">
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Laços de Afeto / Observações da Consulta</label>
                    <input type="text" [(ngModel)]="cons.affectionBondsNotes" placeholder="Interação familiar, estímulos e observações..." />
                  </div>
                  <div>
                    <label style="font-size: 0.76rem; font-weight: 600;">Profissional / Assinatura / UBS</label>
                    <input type="text" [(ngModel)]="cons.professionalAndUnit" placeholder="Nome do médico/enfermeiro e unidade" />
                  </div>
                </div>

                <div style="margin-top: 0.85rem;">
                  <button type="button" class="btn btn-primary" (click)="saveActiveConsultation(cons)">
                    💾 Salvar {{ cons.title }}
                  </button>
                </div>
              </div>
            }
          </div>
        </details>

        <!-- Página 108: Agenda de Consultas Individuais, Atividades Coletivas e Visitas Domiciliares -->
        <details class="section-accordion" name="caderneta-tab-3">
          <summary>📅 Agenda de Consultas, Atividades Coletivas e Visitas Domiciliares (Página 108) • {{ appointmentsAgenda.length }} agendamento(s)</summary>
          <div class="accordion-body">
            <div class="grid-3" style="gap: 0.65rem;">
              <select [(ngModel)]="newAgenda.entryType">
                <option value="Consulta Individual">Consulta Individual</option>
                <option value="Atividade em Grupo">Atividade Coletiva / em Grupo</option>
                <option value="Visita Domiciliar">Visita Domiciliar (ACS / Equipe)</option>
              </select>
              <input type="date" [(ngModel)]="newAgenda.date" />
              <input type="text" [(ngModel)]="newAgenda.timeOrSlot" placeholder="Horário (Ex: 09:30)" />
              <input type="text" [(ngModel)]="newAgenda.professionalOrUnit" placeholder="Profissional / UBS" />
              <input type="text" [(ngModel)]="newAgenda.notes" placeholder="Motivo / Observação" />
              <button type="button" class="btn btn-primary" (click)="addAgendaEntry()">+ Agendar na Caderneta</button>
            </div>

            @if (appointmentsAgenda.length > 0) {
              <div style="margin-top: 0.85rem; display: flex; flex-direction: column; gap: 0.45rem;">
                @for (ag of appointmentsAgenda; track ag.id) {
                  <div style="padding: 0.65rem; border: 1px solid var(--border-subtle); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div style="font-size: 0.85rem;">
                      <span class="badge">{{ ag.entryType }}</span>
                      <strong style="margin-left: 0.5rem;">{{ ag.date | date:'dd/MM/yyyy' }} às {{ ag.timeOrSlot }}</strong>
                      — {{ ag.professionalOrUnit }} ({{ ag.notes }})
                    </div>
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                      <select [(ngModel)]="ag.status" (change)="saveNotesAndAgenda()" style="width: auto; font-size: 0.78rem;">
                        <option value="Agendado">Agendado</option>
                        <option value="Realizado">Realizado ✅</option>
                        <option value="Remarcado">Remarcado</option>
                      </select>
                      <button type="button" class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" (click)="removeAgendaEntry(ag.id)">🗑️</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </details>

        <!-- Página 107: Anotações Gerais -->
        <details class="section-accordion" name="caderneta-tab-3">
          <summary>📝 Anotações Gerais da Caderneta (Página 107) • {{ generalNotes.length }} nota(s)</summary>
          <div class="accordion-body">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <input type="text" [(ngModel)]="newGeneralNoteText" placeholder="Registrar anotação clínica, intercorrência ou orientação..." style="flex: 2;" />
              <input type="text" [(ngModel)]="newGeneralNoteAuthor" placeholder="Autor (Mãe, Pai, Pediatra...)" style="flex: 1;" />
              <button type="button" class="btn btn-primary" (click)="addGeneralNote()">+ Salvar Anotação (p. 107)</button>
            </div>
            @for (gn of generalNotes; track gn.id) {
              <div style="margin-top: 0.5rem; padding: 0.65rem; background: var(--bg-soft); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span><strong>{{ gn.date | date:'dd/MM/yyyy' }} ({{ gn.author }}):</strong> {{ gn.note }}</span>
                <button type="button" class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" (click)="removeGeneralNote(gn.id)">🗑️</button>
              </div>
            }
          </div>
        </details>
      }

      <!-- =========================================================================
           ABA 4: ODONTOGRAMA (p. 101-102), VITAMINA A & FERRO (p. 103)
           ========================================================================= -->
      @if (subTab() === 'odonto_supl') {
        <details class="section-accordion" name="caderneta-tab-4" open>
          <summary>🦷 Odontograma da 1ª Dentição e Consultas Odontológicas (Páginas 101 e 102)</summary>
          <div class="accordion-body">
            <p style="font-size: 0.84rem; color: var(--text-secondary);">
              Clique sobre cada dente para alternar entre <strong>Normal</strong>, <strong>Erupcionado (Nascido)</strong> e <strong>Dente Cariado (X)</strong>.
            </p>

            <div class="grid-2" style="gap: 1rem; margin-top: 0.75rem; align-items: start;">
              <div>
                <h4 style="font-size: 0.88rem; margin-bottom: 0.45rem;">Arcada Superior (10 dentes decíduos)</h4>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem;">
                  @for (t of getTeethByArch('Superior'); track t.code) {
                    <button
                      type="button"
                      class="btn"
                      (click)="cycleToothStatus(t)"
                      [style.border]="t.status === 'Cariado (X)' ? '2px solid var(--cat-health)' : t.status === 'Erupcionado' ? '2px solid var(--cat-diaper)' : '1px solid var(--border-subtle)'"
                      style="display: flex; flex-direction: column; align-items: center; padding: 0.45rem; font-size: 0.74rem;"
                    >
                      <strong>Dente {{ t.code }}</strong>
                      <span style="font-size: 0.68rem; text-align: center;">{{ t.name }}</span>
                      <span class="badge" style="margin-top: 0.25rem; font-size: 0.68rem;">
                        {{ t.status === 'Cariado (X)' ? '❌ Cariado' : t.status === 'Erupcionado' ? '🦷 Nascido' : '⚪ Normal' }}
                      </span>
                    </button>
                  }
                </div>

                <h4 style="font-size: 0.88rem; margin: 0.85rem 0 0.45rem;">Arcada Inferior (10 dentes decíduos)</h4>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem;">
                  @for (t of getTeethByArch('Inferior'); track t.code) {
                    <button
                      type="button"
                      class="btn"
                      (click)="cycleToothStatus(t)"
                      [style.border]="t.status === 'Cariado (X)' ? '2px solid var(--cat-health)' : t.status === 'Erupcionado' ? '2px solid var(--cat-diaper)' : '1px solid var(--border-subtle)'"
                      style="display: flex; flex-direction: column; align-items: center; padding: 0.45rem; font-size: 0.74rem;"
                    >
                      <strong>Dente {{ t.code }}</strong>
                      <span style="font-size: 0.68rem; text-align: center;">{{ t.name }}</span>
                      <span class="badge" style="margin-top: 0.25rem; font-size: 0.68rem;">
                        {{ t.status === 'Cariado (X)' ? '❌ Cariado' : t.status === 'Erupcionado' ? '🦷 Nascido' : '⚪ Normal' }}
                      </span>
                    </button>
                  }
                </div>
              </div>

              <!-- Tabela de Erupção Dentária -->
              <div>
                <h4 style="font-size: 0.88rem; margin-bottom: 0.45rem;">Mês em que erupcionou (nasceu) cada grupo dentário (p. 101)</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                  <thead>
                    <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                      <th style="padding: 0.35rem;">Grupo Dentário</th>
                      <th style="padding: 0.35rem;">Faixa Esperada</th>
                      <th style="padding: 0.35rem;">Mês que nasceu</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (eg of dental.eruptionGroups; track eg.code) {
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 0.35rem; font-weight: 600;">{{ eg.groupName }}</td>
                        <td style="padding: 0.35rem; color: var(--text-secondary);">{{ eg.expectedMonthsRange }}</td>
                        <td style="padding: 0.35rem;">
                          <input type="number" min="0" max="48" [(ngModel)]="eg.eruptionMonth" placeholder="Mês" style="padding: 0.25rem; width: 80px;" />
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Consultas Odontológicas (Página 102) -->
            <div style="margin-top: 1rem;">
              <h4 style="font-size: 0.9rem; margin-bottom: 0.45rem;">📋 Registro das Consultas Odontológicas (Página 102)</h4>
              <div class="grid-3" style="gap: 0.5rem;">
                <input type="date" [(ngModel)]="newDentalConsultation.date" />
                <input type="text" [(ngModel)]="newDentalConsultation.tooth" placeholder="Dente(s) avaliado(s)" />
                <input type="text" [(ngModel)]="newDentalConsultation.proceduresAndOrientations" placeholder="Procedimentos / Orientações realizadas" />
                <input type="date" [(ngModel)]="newDentalConsultation.returnDate" placeholder="Data de retorno" />
                <input type="text" [(ngModel)]="newDentalConsultation.signatureAndHealthUnit" placeholder="Assinatura/carimbo do cirurgião-dentista e UBS" />
                <button type="button" class="btn btn-primary" (click)="addDentalConsultation()">+ Registrar Consulta Odontológica</button>
              </div>

              @if (dental.consultations.length > 0) {
                <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem; margin-top: 0.75rem;">
                  <thead>
                    <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                      <th style="padding: 0.45rem;">Data</th>
                      <th style="padding: 0.45rem;">Dente</th>
                      <th style="padding: 0.45rem;">Procedimentos / Orientações</th>
                      <th style="padding: 0.45rem;">Assinatura e UBS</th>
                      <th style="padding: 0.45rem;">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (dc of dental.consultations; track dc.id) {
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 0.45rem;">{{ dc.date | date:'dd/MM/yyyy' }}</td>
                        <td style="padding: 0.45rem; font-weight: 700;">{{ dc.tooth }}</td>
                        <td style="padding: 0.45rem;">{{ dc.proceduresAndOrientations }}</td>
                        <td style="padding: 0.45rem;">{{ dc.signatureAndHealthUnit }}</td>
                        <td style="padding: 0.45rem;">
                          <button type="button" class="btn" style="padding: 0.2rem 0.45rem; font-size: 0.72rem;" (click)="removeDentalConsultation(dc.id)">🗑️</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }

              <div style="margin-top: 0.75rem;">
                <button type="button" class="btn btn-primary" (click)="saveDental()">💾 Salvar Odontograma e Consultas Odontológicas (p. 101 e 102)</button>
              </div>
            </div>
          </div>
        </details>

        <!-- Página 103: Suplementação de Vitamina A, Ferro e Outros Micronutrientes -->
        <details class="section-accordion" name="caderneta-tab-4">
          <summary>💊 Suplementação de Vitamina A, Ferro e Micronutrientes (Página 103)</summary>
          <div class="accordion-body">
            <h4 style="font-size: 0.88rem; margin: 0 0 0.5rem;">Megadose de Vitamina A (Crianças de 6 meses a 4 anos e 11 meses)</h4>
            <div class="grid-3" style="gap: 0.65rem;">
              @for (va of supplementation.vitaminADoses; track va.slotNumber) {
                <div style="padding: 0.65rem; border: 1px solid var(--border-subtle); border-radius: 10px;">
                  <strong style="font-size: 0.8rem; display: block; margin-bottom: 0.35rem;">{{ va.agePeriodLabel }}</strong>
                  <input type="date" [(ngModel)]="va.appliedDate" style="margin-bottom: 0.35rem;" />
                  <input type="text" [(ngModel)]="va.healthUnitAndSignature" placeholder="Unidade / Assinatura" />
                </div>
              }
            </div>

            <h4 style="font-size: 0.88rem; margin: 1rem 0 0.5rem;">Suplementação de Ferro (Sulfato Ferroso) ou Outros Micronutrientes (NutriSUS)</h4>
            <div class="grid-3" style="gap: 0.5rem;">
              <input type="date" [(ngModel)]="newIron.deliveryDate" />
              <input type="text" [(ngModel)]="newIron.childAge" placeholder="Idade da criança (Ex: 6 meses)" />
              <input type="text" [(ngModel)]="newIron.supplementDistributed" placeholder="Suplemento (Sulfato Ferroso / NutriSUS)" />
              <input type="text" [(ngModel)]="newIron.quantityDistributed" placeholder="Quantidade (Ex: 1 frasco 30ml / 60 sachês)" />
              <input type="text" [(ngModel)]="newIron.signature" placeholder="Assinatura / Unidade" />
              <button type="button" class="btn btn-primary" (click)="addIronSupply()">+ Registrar Entrega de Suplemento</button>
            </div>

            @if (supplementation.ironAndMicronutrients.length > 0) {
              <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem; margin-top: 0.75rem;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border-strong); text-align: left;">
                    <th style="padding: 0.45rem;">Data da Entrega</th>
                    <th style="padding: 0.45rem;">Idade</th>
                    <th style="padding: 0.45rem;">Suplemento Distribuído</th>
                    <th style="padding: 0.45rem;">Quantidade</th>
                    <th style="padding: 0.45rem;">Assinatura</th>
                    <th style="padding: 0.45rem;">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  @for (ir of supplementation.ironAndMicronutrients; track ir.id) {
                    <tr style="border-bottom: 1px solid var(--border-subtle);">
                      <td style="padding: 0.45rem;">{{ ir.deliveryDate | date:'dd/MM/yyyy' }}</td>
                      <td style="padding: 0.45rem;">{{ ir.childAge }}</td>
                      <td style="padding: 0.45rem; font-weight: 700;">{{ ir.supplementDistributed }}</td>
                      <td style="padding: 0.45rem;">{{ ir.quantityDistributed }}</td>
                      <td style="padding: 0.45rem;">{{ ir.signature }}</td>
                      <td style="padding: 0.45rem;">
                        <button type="button" class="btn" style="padding: 0.2rem 0.45rem; font-size: 0.72rem;" (click)="removeIronSupply(ir.id)">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            <div style="margin-top: 0.75rem;">
              <button type="button" class="btn btn-primary" (click)="saveSupplementation()">
                💾 Salvar Suplementação de Vitamina A e Ferro (p. 103)
              </button>
            </div>
          </div>
        </details>
      }

      <!-- =========================================================================
           ABA 5: GUIAS ILUSTRADOS OFICIAIS DA CADERNETA (Páginas 14 a 66)
           ========================================================================= -->
      @if (subTab() === 'guias') {
        <section class="card">
          <h3 class="section-title">📚 Guias Completos da Parte I da Caderneta da Criança (Páginas 14 a 66)</h3>
          <div class="grid-2" style="gap: 1rem; margin-top: 0.75rem;">
            <div style="padding: 0.85rem; background: var(--bg-soft); border-radius: 12px;">
              <h4 style="margin-bottom: 0.4rem;">💩 Escala Oficial de Cores das Fezes (Página 18)</h4>
              <p style="font-size: 0.83rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                As cores <strong>1 a 5</strong> são normais. As cores <strong>6, 7 e 8 (esbranquiçadas, acinzentadas ou amarelo-claras)</strong> são suspeitas de doenças hepáticas graves e exigem avaliação médica imediata!
              </p>
              <img src="imagens/p020_pag018_escala_cores_fezes.jpg" alt="Escala Oficial de Cores das Fezes da Caderneta da Criança p. 18" style="width: 100%; max-width: 420px; border-radius: 8px; border: 1px solid var(--border-subtle);" />
            </div>

            <div style="padding: 0.85rem; background: var(--bg-soft); border-radius: 12px;">
              <h4 style="margin-bottom: 0.4rem;">🦘 Cuidados com o Bebê Pré-Termo e Método Canguru (Páginas 19 a 21)</h4>
              <p style="font-size: 0.83rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                Toda criança nascida com menos de 37 semanas é pré-termo. O contato pele a pele na Posição Canguru aquece o bebê, fortalece o vínculo afetivo e estimula a amamentação. Avaliada pela <strong>Idade Corrigida</strong> até os 2 anos.
              </p>
              <img src="imagens/p022_pag020_metodo_canguru.jpg" alt="Método Canguru p. 20" style="width: 100%; max-width: 280px; border-radius: 8px; border: 1px solid var(--border-subtle);" />
            </div>

            <div style="padding: 0.85rem; background: var(--bg-soft); border-radius: 12px;">
              <h4 style="margin-bottom: 0.4rem;">💧 Prevenção da Desidratação e Preparo do Soro Caseiro (Página 22)</h4>
              <p style="font-size: 0.83rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                Em caso de diarreia, mantenha o leite materno e ofereça Soro de Reidratação Oral (SRO) da UBS após cada evacuação líquida. Soro caseiro: 1 litro de água filtrada/fervida fria + 1 colher de café rasa de sal + 1 colher de sopa cheia de açúcar.
              </p>
              <img src="imagens/p024_pag022_soro_caseiro.jpg" alt="Preparo do Soro Caseiro p. 22" style="width: 100%; max-width: 380px; border-radius: 8px; border: 1px solid var(--border-subtle);" />
            </div>

            <div style="padding: 0.85rem; background: var(--bg-soft); border-radius: 12px;">
              <h4 style="margin-bottom: 0.4rem;">🛏️ Sono Seguro e Prevenção de Acidentes (Páginas 17 e 60 a 65)</h4>
              <p style="font-size: 0.83rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                Coloque sempre o bebê para dormir de <strong>barriga para cima</strong> em colchão firme, sem travesseiros, protetores de berço ou brinquedos soltos. Intoxicação: <strong>CIATox 0800-722-6001</strong> ou <strong>SAMU 192</strong>.
              </p>
              <img src="imagens/p063_pag061_berco_seguro.jpg" alt="Berço Seguro p. 61" style="width: 100%; max-width: 340px; border-radius: 8px; border: 1px solid var(--border-subtle);" />
            </div>
          </div>
        </section>
      }
    </div>
  `
})
export class CadernetaHubComponent {
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);

  readonly subTab = signal<CadernetaSectionTab>('identificacao');
  readonly selectedConsultationCode = signal<string>('1_SEMANA');

  babyName = '';
  babyBirthDate = '';
  babyBloodType = 'O+';
  pediatricianName = '';
  pediatricianCrm = '';

  identification: ChildIdentification = {
    photoUrl: '',
    birthMunicipality: '',
    motherName: '',
    fatherName: '',
    guardianName: '',
    ethnicity: '',
    raceColor: 'Parda',
    address: '',
    referencePoint: '',
    phone: '',
    cep: '',
    neighborhood: '',
    city: '',
    state: '',
    ubsName: '',
    dseiPoloBase: '',
    cnsNumber: '',
    dnvNumber: '',
    birthCertificateNumber: '',
    cpf: ''
  };

  addressHistory: AddressChangeRecord[] = [];
  newAddress: Partial<AddressChangeRecord> = {};

  socialAssistance: SocialAssistanceRecord = {
    childNis: '',
    guardianNis: '',
    crasName: '',
    crasPhone: '',
    crasAddress: '',
    bolsaFamiliaEnrolled: false,
    bolsaFamiliaEntryYear: '',
    bolsaFamiliaExitYear: '',
    bpcEnrolled: false,
    bpcEntryYear: '',
    bpcExitYear: '',
    criancaFelizEnrolled: false,
    criancaFelizEntryYear: '',
    criancaFelizExitYear: '',
    otherPrograms: [],
    socialNotes: []
  };
  newSocialNoteText = '';
  newSocialNoteAuthor = '';

  educationRecords: SchoolLifeRecord[] = [];
  newSchool: Partial<SchoolLifeRecord> = { gradeType: 'Creche / Educação Infantil', institutionNature: 'Pública' };

  prenatalAndBirth: PrenatalBirthRecord = {
    plannedPregnancy: true,
    hadPrenatalCare: true,
    prenatalConsultationsCount: 8,
    startedTrimester: '1º',
    pregnancyType: 'Única',
    highRiskPregnancy: false,
    highRiskReason: '',
    serologies: [
      { cid10Code: 'A53', conditionName: 'Sífilis (CID-10 A53)', trimester1: 'N', trimester2: 'N', trimester3: 'N' },
      { cid10Code: 'B18', conditionName: 'Hepatite B/C (CID-10 B18)', trimester1: 'N', trimester2: 'N', trimester3: 'N' },
      { cid10Code: 'B58', conditionName: 'Toxoplasmose (CID-10 B58)', trimester1: 'N', trimester2: 'N', trimester3: 'N' },
      { cid10Code: 'Zika', conditionName: 'Vírus Zika', trimester1: 'N', trimester2: 'N', trimester3: 'N' }
    ],
    vaccineDtpa: true,
    vaccineInfluenza: true,
    vaccineHepatitisB: true,
    vaccineCovid19: true,
    birthPlaceType: 'Hospital',
    birthPlaceOther: '',
    maternityName: '',
    deliveryType: 'Vaginal',
    cesareanReason: '',
    companionsAtBirth: '',
    birthTime: '08:30',
    skinToSkinContact: true,
    breastfedFirstHour: true,
    apgar1Min: 9,
    apgar5Min: 10,
    timelyCordClamping: true,
    igMethod: 'USG',
    birthWeightGrams: 3200,
    birthLengthCm: 49,
    birthHeadCircumferenceCm: 34.5,
    weightForGestationalAge: 'AIG',
    neonatalResuscitation: false,
    assistedBy: 'Pediatra',
    motherBloodType: 'O+',
    indirectCoombs: 'Negativo',
    babyBloodType: 'O+',
    directCoombs: 'Negativo',
    ophthalmicProphylaxis: true,
    ophthalmicReason: '',
    hemorrhagicProphylaxisVitK: true,
    vitKReason: '',
    wasHospitalized: false,
    hospitalizationUnit: 'ALCON',
    hospitalizationDays: 2,
    hospitalizationReason: 'Alojamento conjunto habitual',
    dischargeReport: '',
    dischargeWeightGrams: 3150,
    dischargeLengthCm: 49,
    dischargeFeeding: 'Aleitamento materno exclusivo'
  };

  neonatalScreenings: NeonatalScreeningRecord = {
    redReflexPerformed: true,
    redReflexRightEye: 'Normal',
    redReflexLeftEye: 'Normal',
    redReflexObservations: '',
    pulseOximetryPerformed: true,
    pulseOximetryResult: 'Normal',
    pulseOximetryObservations: '',
    hearingScreeningPerformed: true,
    hearingMethod: 'EOA',
    hearingRightEar: 'Normal',
    hearingLeftEar: 'Normal',
    hearingConduct: 'Alta com orientação',
    heelPrickPerformed: true,
    heelPrickRetest: false,
    heelPrickResult: 'Normal para todas as condições triadas',
    heelPrickReferral: 'AB',
    heelPrickObservations: ''
  };

  consultations: RoutineConsultationRecord[] = [];
  dental: DentalRecord = { eruptionGroups: [], odontogramTeeth: [], consultations: [] };
  newDentalConsultation: Partial<DentalRecord['consultations'][0]> = { date: new Date().toISOString().slice(0, 10) };

  supplementation: SupplementationRecord = { vitaminADoses: [], ironAndMicronutrients: [] };
  newIron: Partial<SupplementationRecord['ironAndMicronutrients'][0]> = {
    deliveryDate: new Date().toISOString().slice(0, 10),
    supplementDistributed: 'Sulfato Ferroso',
    quantityDistributed: '1 frasco / 30 ml'
  };

  appointmentsAgenda: AgendaEntryRecord[] = [];
  newAgenda: Partial<AgendaEntryRecord> = {
    entryType: 'Consulta Individual',
    date: new Date().toISOString().slice(0, 10),
    timeOrSlot: '09:00',
    status: 'Agendado'
  };

  generalNotes: CadernetaNoteRecord[] = [];
  newGeneralNoteText = '';
  newGeneralNoteAuthor = 'Mãe/Pai';

  constructor() {
    effect(() => {
      const b = this.babyStore.activeBaby();
      if (!b || !b.id) return;
      this.babyName = b.name;
      this.babyBirthDate = (b.birthDate ?? '').slice(0, 10);
      this.babyBloodType = b.bloodType || 'O+';
      this.pediatricianName = b.pediatrician?.name || '';
      this.pediatricianCrm = b.pediatrician?.crm || '';

      if (b.identification) this.identification = structuredClone(b.identification);
      if (b.addressHistory) this.addressHistory = structuredClone(b.addressHistory);
      if (b.socialAssistance) this.socialAssistance = structuredClone(b.socialAssistance);
      if (b.educationRecords) this.educationRecords = structuredClone(b.educationRecords);
      if (b.prenatalAndBirth) this.prenatalAndBirth = structuredClone(b.prenatalAndBirth);
      if (b.neonatalScreenings) this.neonatalScreenings = structuredClone(b.neonatalScreenings);
      if (b.scheduledConsultations) this.consultations = structuredClone(b.scheduledConsultations);
      if (b.dental) this.dental = structuredClone(b.dental);
      if (b.supplementation) this.supplementation = structuredClone(b.supplementation);
      if (b.appointmentsAgenda) this.appointmentsAgenda = structuredClone(b.appointmentsAgenda);
      if (b.generalNotes) this.generalNotes = structuredClone(b.generalNotes);
    });
  }

  activeConsultation(): RoutineConsultationRecord | undefined {
    return this.consultations.find(c => c.code === this.selectedConsultationCode()) ?? this.consultations[0];
  }

  selectConsultation(code: string): void {
    this.selectedConsultationCode.set(code);
  }

  async saveIdentificationAndSocial(): Promise<void> {
    await this.routineStore.updateIdentificationAndSocial({
      name: this.babyName,
      birthDate: this.babyBirthDate ? new Date(this.babyBirthDate).toISOString() : undefined,
      bloodType: this.babyBloodType,
      pediatrician: {
        name: this.pediatricianName,
        crm: this.pediatricianCrm,
        emergencyPhone: this.babyStore.activeBaby().pediatrician?.emergencyPhone ?? ''
      },
      identification: this.identification,
      addressHistory: this.addressHistory,
      socialAssistance: this.socialAssistance,
      educationRecords: this.educationRecords
    });
  }

  async addAddressChange(): Promise<void> {
    if (!this.newAddress.address) return;
    this.addressHistory.push({
      id: Math.random().toString(36).slice(2, 10),
      recordedAt: new Date().toISOString(),
      address: this.newAddress.address ?? '',
      referencePoint: this.newAddress.referencePoint ?? '',
      phone: this.newAddress.phone ?? '',
      cep: this.newAddress.cep ?? '',
      neighborhood: this.newAddress.neighborhood ?? '',
      city: this.newAddress.city ?? '',
      state: this.newAddress.state ?? '',
      ubsName: this.newAddress.ubsName ?? ''
    });
    this.newAddress = {};
    await this.saveIdentificationAndSocial();
  }

  async removeAddressChange(id: string): Promise<void> {
    this.addressHistory = this.addressHistory.filter(a => a.id !== id);
    await this.saveIdentificationAndSocial();
  }

  async addSocialNote(): Promise<void> {
    if (!this.newSocialNoteText.trim()) return;
    this.socialAssistance.socialNotes.push({
      id: Math.random().toString(36).slice(2, 10),
      date: new Date().toISOString(),
      note: this.newSocialNoteText.trim(),
      professionalOrCras: this.newSocialNoteAuthor || 'CRAS'
    });
    this.newSocialNoteText = '';
    await this.saveIdentificationAndSocial();
  }

  async removeSocialNote(id: string): Promise<void> {
    this.socialAssistance.socialNotes = this.socialAssistance.socialNotes.filter(n => n.id !== id);
    await this.saveIdentificationAndSocial();
  }

  async addSchoolRecord(): Promise<void> {
    if (!this.newSchool.establishmentName) return;
    this.educationRecords.push({
      id: Math.random().toString(36).slice(2, 10),
      year: this.newSchool.year || new Date().getFullYear().toString(),
      gradeType: this.newSchool.gradeType || 'Educação Infantil',
      series: this.newSchool.series || '',
      establishmentName: this.newSchool.establishmentName || '',
      institutionNature: this.newSchool.institutionNature || 'Pública',
      observations: this.newSchool.observations || ''
    });
    this.newSchool = { gradeType: 'Creche / Educação Infantil', institutionNature: 'Pública' };
    await this.saveIdentificationAndSocial();
  }

  async removeSchoolRecord(id: string): Promise<void> {
    this.educationRecords = this.educationRecords.filter(e => e.id !== id);
    await this.saveIdentificationAndSocial();
  }

  async savePrenatalAndScreenings(): Promise<void> {
    await this.routineStore.updatePrenatalAndScreenings({
      prenatalAndBirth: this.prenatalAndBirth,
      neonatalScreenings: this.neonatalScreenings
    });
  }

  async saveActiveConsultation(cons: RoutineConsultationRecord): Promise<void> {
    await this.routineStore.updateConsultation(cons.code, cons);
  }

  getTeethByArch(arch: 'Superior' | 'Inferior') {
    return (this.dental.odontogramTeeth ?? []).filter(t => t.arch === arch);
  }

  cycleToothStatus(tooth: DentalRecord['odontogramTeeth'][0]): void {
    if (tooth.status === 'Normal') tooth.status = 'Erupcionado';
    else if (tooth.status === 'Erupcionado') tooth.status = 'Cariado (X)';
    else tooth.status = 'Normal';
  }

  async addDentalConsultation(): Promise<void> {
    if (!this.newDentalConsultation.proceduresAndOrientations) return;
    this.dental.consultations.push({
      id: Math.random().toString(36).slice(2, 10),
      date: this.newDentalConsultation.date ? new Date(this.newDentalConsultation.date).toISOString() : new Date().toISOString(),
      tooth: this.newDentalConsultation.tooth || 'Todos',
      proceduresAndOrientations: this.newDentalConsultation.proceduresAndOrientations,
      returnDate: this.newDentalConsultation.returnDate ? new Date(this.newDentalConsultation.returnDate).toISOString() : undefined,
      signatureAndHealthUnit: this.newDentalConsultation.signatureAndHealthUnit || ''
    });
    this.newDentalConsultation = { date: new Date().toISOString().slice(0, 10) };
    await this.saveDental();
  }

  async removeDentalConsultation(id: string): Promise<void> {
    this.dental.consultations = this.dental.consultations.filter(c => c.id !== id);
    await this.saveDental();
  }

  async saveDental(): Promise<void> {
    await this.routineStore.updateDental(this.dental);
  }

  async addIronSupply(): Promise<void> {
    if (!this.newIron.supplementDistributed) return;
    this.supplementation.ironAndMicronutrients.push({
      id: Math.random().toString(36).slice(2, 10),
      deliveryDate: this.newIron.deliveryDate ? new Date(this.newIron.deliveryDate).toISOString() : new Date().toISOString(),
      childAge: this.newIron.childAge || '',
      supplementDistributed: this.newIron.supplementDistributed || 'Sulfato Ferroso',
      quantityDistributed: this.newIron.quantityDistributed || '1 frasco',
      signature: this.newIron.signature || ''
    });
    await this.saveSupplementation();
  }

  async removeIronSupply(id: string): Promise<void> {
    this.supplementation.ironAndMicronutrients = this.supplementation.ironAndMicronutrients.filter(i => i.id !== id);
    await this.saveSupplementation();
  }

  async saveSupplementation(): Promise<void> {
    await this.routineStore.updateSupplementation(this.supplementation);
  }

  async addAgendaEntry(): Promise<void> {
    this.appointmentsAgenda.push({
      id: Math.random().toString(36).slice(2, 10),
      entryType: this.newAgenda.entryType || 'Consulta Individual',
      date: this.newAgenda.date ? new Date(this.newAgenda.date).toISOString() : new Date().toISOString(),
      timeOrSlot: this.newAgenda.timeOrSlot || '09:00',
      professionalOrUnit: this.newAgenda.professionalOrUnit || '',
      notes: this.newAgenda.notes || '',
      status: 'Agendado'
    });
    await this.saveNotesAndAgenda();
  }

  async removeAgendaEntry(id: string): Promise<void> {
    this.appointmentsAgenda = this.appointmentsAgenda.filter(a => a.id !== id);
    await this.saveNotesAndAgenda();
  }

  async addGeneralNote(): Promise<void> {
    if (!this.newGeneralNoteText.trim()) return;
    this.generalNotes.push({
      id: Math.random().toString(36).slice(2, 10),
      date: new Date().toISOString(),
      note: this.newGeneralNoteText.trim(),
      author: this.newGeneralNoteAuthor || 'Responsável'
    });
    this.newGeneralNoteText = '';
    await this.saveNotesAndAgenda();
  }

  async removeGeneralNote(id: string): Promise<void> {
    this.generalNotes = this.generalNotes.filter(n => n.id !== id);
    await this.saveNotesAndAgenda();
  }

  async saveNotesAndAgenda(): Promise<void> {
    await this.routineStore.updateNotesAndAgenda({
      generalNotes: this.generalNotes,
      appointmentsAgenda: this.appointmentsAgenda
    });
  }
}
