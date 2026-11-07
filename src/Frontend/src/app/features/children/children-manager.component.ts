import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { BabyModel, BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { PopupAlertService } from '../../core/services/popup-alert.service';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';
import { BabyAgePipe } from '../../shared/pipes/baby-age.pipe';
import { OfficialReferenceComponent } from '../../shared/components/official-reference/official-reference.component';

@Component({
  selector: 'app-children-manager',
  standalone: true,
  imports: [FormsModule, DatePipe, BabyAgePipe, OfficialReferenceComponent],
  template: `
    <div class="grid-2">
      <!-- Lista de Filhos vinculados à Conta Google atual -->
      <section class="card" style="border-top: 4px solid var(--cat-sleep);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <h3 class="section-title" style="margin-bottom: 0.1rem;">
              <span aria-hidden="true">👶</span>
              <span>Crianças Vinculadas</span>
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-secondary);">
              Conta Google: <strong>{{ authService.currentUser()?.email }}</strong>
            </p>
          </div>
          <span class="badge badge-sleep">{{ babyStore.babies().length }} cadastro(s)</span>
        </div>

        @if (babyStore.babies().length === 0) {
          <div class="card-elevated" style="text-align: center; padding: 1.25rem;">
            <p style="font-weight: 700;">Nenhuma criança cadastrada nesta conta ainda.</p>
          </div>
        }

        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          @for (b of babyStore.babies(); track b.id) {
            <div
              class="card-elevated"
              [style.border-width]="babyStore.selectedBabyId() === b.id ? '2px' : '1px'"
              [style.border-color]="babyStore.selectedBabyId() === b.id ? 'var(--cat-sleep)' : 'var(--border-subtle)'">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                    <span style="font-size: 1rem; font-weight: 800;">{{ b.name }}</span>
                    @if (babyStore.selectedBabyId() === b.id) {
                      <span class="badge badge-diaper">✓ Ativa</span>
                    }
                    @if ((b.sharedWithEmails?.length ?? 0) > 0 || (b.ownerUserId && b.ownerUserId !== babyStore.currentUserId())) {
                      <span class="badge badge-sleep" title="Criança compartilhada entre contas Google">🤝 Compartilhada</span>
                    }
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">
                    <strong>{{ b | babyAge }}</strong> • Nasc.: {{ b.birthDate | date:'dd/MM/yyyy' }} ({{ b.gestationalWeeks }}s {{ b.gestationalDays }}d)
                  </div>
                  <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.1rem;">
                    {{ b.currentWeightGrams }}g • {{ b.currentHeightCm }}cm • PC {{ b.headCircumferenceCm }}cm • {{ b.bloodType }}
                  </div>
                </div>

                <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                  <button
                    type="button"
                    class="btn btn-sleep"
                    style="min-height: 34px; font-size: 0.78rem;"
                    (click)="selectChild(b.id)">
                    <span>Selecionar</span>
                  </button>

                  <button
                    type="button"
                    class="btn"
                    style="min-height: 34px; font-size: 0.78rem;"
                    (click)="toggleSharePanel(b.id)"
                    [attr.aria-expanded]="sharingBabyId() === b.id"
                    title="Compartilhar criança com outra conta Google">
                    <span aria-hidden="true">🤝</span>
                    <span>Compartilhar</span>
                  </button>

                  <button
                    type="button"
                    class="btn"
                    style="min-height: 34px; font-size: 0.78rem;"
                    (click)="removeChild(b.id)"
                    title="Remover cadastro">
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </div>
              </div>

              @if ((b.sharedWithEmails?.length ?? 0) > 0 && sharingBabyId() !== b.id) {
                <div style="margin-top: 0.5rem; padding-top: 0.45rem; border-top: 1px dashed var(--border-subtle); font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                  <span>Contas vinculadas:</span>
                  @for (email of b.sharedWithEmails; track email) {
                    <span class="badge" style="font-size: 0.7rem;">{{ email }}</span>
                  }
                </div>
              }

              @if (sharingBabyId() === b.id) {
                <div
                  style="margin-top: 0.65rem; padding-top: 0.65rem; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 0.5rem;">
                  <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary);">
                    Compartilhar {{ b.name }} com outra conta Google já cadastrada:
                  </label>
                  <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <input
                      type="email"
                      class="input-field"
                      style="flex: 1; min-width: 200px; min-height: 36px; font-size: 0.82rem;"
                      [(ngModel)]="shareEmailInput"
                      placeholder="exemplo@gmail.com"
                      (keyup.enter)="shareChild(b)" />
                    <button
                      type="button"
                      class="btn btn-diaper"
                      style="min-height: 36px; font-size: 0.78rem;"
                      (click)="shareChild(b)">
                      <span aria-hidden="true">➕</span>
                      <span>Vincular E-mail</span>
                    </button>
                    <button
                      type="button"
                      class="btn"
                      style="min-height: 36px; font-size: 0.78rem;"
                      (click)="sharingBabyId.set(null)">
                      <span>Fechar</span>
                    </button>
                  </div>

                  @if ((b.sharedWithEmails?.length ?? 0) > 0) {
                    <div style="display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.2rem;">
                      <span style="font-size: 0.74rem; color: var(--text-secondary); font-weight: 600;">
                        E-mails com acesso compartilhado a esta criança:
                      </span>
                      <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                        @for (email of b.sharedWithEmails; track email) {
                          <span
                            class="badge"
                            style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.5rem; font-size: 0.74rem;">
                            <span>{{ email }}</span>
                            <button
                              type="button"
                              style="background: none; border: none; color: inherit; cursor: pointer; font-weight: 800; padding: 0 0.15rem;"
                              title="Remover acesso deste e-mail"
                              (click)="unshareChild(b.id, email)">
                              ✕
                            </button>
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- Formulário para Adicionar Novo Filho(a) à Conta Google -->
      <section class="card" style="border-top: 4px solid var(--cat-diaper);">
        <h3 class="section-title">
          <span aria-hidden="true">➕</span>
          <span>Cadastrar Nova Criança</span>
        </h3>

        <div class="grid-2" style="margin-bottom: 0.85rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Nome da Criança</label>
            <input type="text" class="input-field" [(ngModel)]="name" placeholder="Nome completo" />
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Data de Nascimento</label>
            <input type="date" class="input-field" [(ngModel)]="birthDateInput" />
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">IG — Semanas</label>
            <input type="number" class="input-field" [(ngModel)]="gestationalWeeks" min="24" max="42" />
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">IG — Dias</label>
            <input type="number" class="input-field" [(ngModel)]="gestationalDays" min="0" max="6" />
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Peso (g)</label>
            <input type="number" class="input-field" [(ngModel)]="currentWeightGrams" min="500" max="20000" />
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Comprimento / Estatura (cm)</label>
            <input type="number" step="0.5" class="input-field" [(ngModel)]="currentHeightCm" min="30" max="110" />
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Perímetro Cefálico — PC (cm)</label>
            <input type="number" step="0.1" class="input-field" [(ngModel)]="headCircumferenceCm" min="20" max="60" />
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Sexo</label>
            <select class="input-field" [(ngModel)]="gender">
              <option value="F">Menina (Feminino)</option>
              <option value="M">Menino (Masculino)</option>
            </select>
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.2rem;">Tipo Sanguíneo</label>
            <select class="input-field" [(ngModel)]="bloodType">
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-diaper"
          style="width: 100%;"
          (click)="createChild()">
          <span aria-hidden="true">👶</span>
          <span>Cadastrar Criança</span>
        </button>

        <details class="info-disclosure">
          <summary>💡 Sobre a Caderneta e Idade Corrigida para Prematuros (pág. 2, 19 e 89)</summary>
          <div class="info-disclosure-body">
            <p>
              Para bebês nascidos com menos de 37 semanas (pré-termo), corrige-se a idade diminuindo da idade cronológica o tempo que faltou para completar 40 semanas de gestação.
            </p>
            <app-official-reference page="p. 2, 4, 19 e 89" />
          </div>
        </details>
      </section>
    </div>
  `
})
export class ChildrenManagerComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly babyStore = inject(BabyStore);
  readonly routineStore = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);
  private readonly loadingOverlay = inject(LoadingOverlayService);

  @Output() readonly childSelected = new EventEmitter<void>();

  readonly sharingBabyId = signal<string | null>(null);
  shareEmailInput = '';

  name = '';
  birthDateInput = '';
  gestationalWeeks = 39;
  gestationalDays = 0;
  gender = 'F';
  currentWeightGrams = 3200;
  currentHeightCm = 49;
  headCircumferenceCm = 35;
  bloodType = 'O+';

  async ngOnInit(): Promise<void> {
    if (this.authService.isAuthenticated()) {
      await this.loadingOverlay.runWithLoading(
        () => this.routineStore.loadFamilyAndBabies(),
        'Carregando cadastro das crianças...'
      );
    }
  }

  async selectChild(babyId: string): Promise<void> {
    await this.loadingOverlay.runWithLoading(async () => {
      this.babyStore.selectBaby(babyId);
      await this.routineStore.refreshAllForBaby(babyId, true);
    }, `Carregando dados de ${this.babyStore.activeBaby()?.name || 'criança'}...`);
    this.childSelected.emit();
  }

  async createChild(): Promise<void> {
    if (!this.name.trim()) {
      this.popupAlert.incompleteForm('Informe o nome do filho(a) para realizar o cadastro.');
      return;
    }
    if (!this.birthDateInput) {
      this.popupAlert.incompleteForm('Informe a data de nascimento do filho(a).');
      return;
    }
    if (
      !this.gestationalWeeks ||
      this.gestationalWeeks < 22 ||
      this.gestationalWeeks > 44 ||
      this.gestationalDays === null ||
      this.gestationalDays === undefined ||
      this.gestationalDays < 0 ||
      this.gestationalDays > 6
    ) {
      this.popupAlert.incompleteForm('Preencha as semanas e dias gestacionais com valores válidos.');
      return;
    }
    if (
      !this.currentWeightGrams ||
      this.currentWeightGrams <= 0 ||
      !this.currentHeightCm ||
      this.currentHeightCm <= 0 ||
      !this.headCircumferenceCm ||
      this.headCircumferenceCm <= 0
    ) {
      this.popupAlert.incompleteForm('Preencha o peso, o comprimento e o perímetro cefálico com valores válidos.');
      return;
    }

    const created = await this.routineStore.createChildForAuthenticatedUser({
      name: this.name.trim(),
      birthDate: new Date(this.birthDateInput).toISOString(),
      gestationalWeeks: this.gestationalWeeks,
      gestationalDays: this.gestationalDays,
      gender: this.gender,
      birthWeightGrams: this.currentWeightGrams,
      birthLengthCm: this.currentHeightCm,
      currentWeightGrams: this.currentWeightGrams,
      currentHeightCm: this.currentHeightCm,
      headCircumferenceCm: this.headCircumferenceCm,
      bloodType: this.bloodType
    });
    if (created) {
      this.name = '';
      this.birthDateInput = '';
      this.childSelected.emit();
    }
  }

  async removeChild(babyId: string): Promise<void> {
    await this.routineStore.deleteChildForAuthenticatedUser(babyId);
  }

  toggleSharePanel(babyId: string): void {
    if (this.sharingBabyId() === babyId) {
      this.sharingBabyId.set(null);
    } else {
      this.sharingBabyId.set(babyId);
      this.shareEmailInput = '';
    }
  }

  async shareChild(baby: BabyModel): Promise<void> {
    const email = this.shareEmailInput.trim();
    if (!email) {
      this.popupAlert.incompleteForm('Informe o e-mail da conta Google que deseja vincular.');
      return;
    }

    await this.loadingOverlay.runWithLoading(async () => {
      const updated = await this.routineStore.shareChildWithEmail(baby.id, email);
      if (updated) {
        this.shareEmailInput = '';
      }
    }, `Compartilhando ${baby.name}...`);
  }

  async unshareChild(babyId: string, email: string): Promise<void> {
    await this.loadingOverlay.runWithLoading(async () => {
      await this.routineStore.unshareChildFromEmail(babyId, email);
    }, 'Removendo compartilhamento...');
  }
}
