import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { RoutineStore } from '../../core/state/routine.store';
import { PopupAlertService } from '../../core/services/popup-alert.service';

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .auth-loading-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: authFadeIn 0.2s ease-out;
      cursor: wait;
      user-select: none;
    }

    .auth-loading-modal {
      background: var(--bg-surface, #ffffff);
      color: var(--text-primary, #1e293b);
      border: 1px solid var(--border-strong, #cbd5e1);
      border-top: 5px solid var(--cat-sleep, #6366f1);
      border-radius: 20px;
      padding: 2.25rem 2rem;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      animation: authScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .auth-spinner-container {
      position: relative;
      width: 76px;
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .auth-spinner {
      position: absolute;
      inset: 0;
      border: 4px solid var(--cat-sleep-bg, rgba(99, 102, 241, 0.2));
      border-top-color: var(--cat-sleep, #6366f1);
      border-right-color: var(--cat-sleep, #6366f1);
      border-radius: 50%;
      animation: authSpin 0.9s linear infinite;
    }

    .auth-spinner-logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
      border-radius: 10px;
      animation: authPulse 2s ease-in-out infinite;
    }

    .auth-loading-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0 0 0.4rem 0;
      color: var(--text-primary);
    }

    .auth-loading-desc {
      font-size: 0.88rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin: 0;
    }

    .auth-loading-bar {
      width: 100%;
      height: 4px;
      background: var(--bg-surface-elevated, #f1f5f9);
      border-radius: 999px;
      overflow: hidden;
      position: relative;
      margin-top: 0.25rem;
    }

    .auth-loading-bar-inner {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 40%;
      background: var(--cat-sleep, #6366f1);
      border-radius: 999px;
      animation: authBarSlide 1.4s ease-in-out infinite;
    }

    @keyframes authSpin {
      to { transform: rotate(360deg); }
    }

    @keyframes authPulse {
      0%, 100% { transform: scale(1); opacity: 0.95; }
      50% { transform: scale(1.08); opacity: 1; }
    }

    @keyframes authFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes authScaleIn {
      from { opacity: 0; transform: scale(0.92) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes authBarSlide {
      0% { left: -40%; width: 30%; }
      50% { left: 30%; width: 50%; }
      100% { left: 100%; width: 30%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .auth-spinner {
        animation-duration: 2s;
      }
      .auth-spinner-logo,
      .auth-loading-modal,
      .auth-loading-overlay,
      .auth-loading-bar-inner {
        animation: none !important;
      }
    }
  `],
  template: `
    @if (isLoading()) {
      <!-- Overlay de Bloqueio de Tela com Loading Durante Autenticação -->
      <div
        class="auth-loading-overlay"
        role="status"
        aria-live="polite"
        aria-label="Autenticação em andamento"
        tabindex="-1">
        <div class="auth-loading-modal">
          <div class="auth-spinner-container">
            <div class="auth-spinner" aria-hidden="true"></div>
            <img
              src="app-icon.png"
              alt=""
              class="auth-spinner-logo"
              aria-hidden="true" />
          </div>
          <div>
            <h2 class="auth-loading-title">Autenticando...</h2>
            <p class="auth-loading-desc">
              Conectando com o Google e preparando a sua Caderneta do Bebê. Por favor, aguarde.
            </p>
          </div>
          <div class="auth-loading-bar" aria-hidden="true">
            <div class="auth-loading-bar-inner"></div>
          </div>
        </div>
      </div>
    }

    <div style="margin: 3rem auto;">
      <section class="card" style="border-top: 5px solid var(--cat-sleep); padding: 2rem;">
        <div style="text-align: center; margin-bottom: 1.75rem;">
          <img
            src="app-icon.png"
            alt="Caderneta do Bebê"
            style="width: 72px; height: 72px; object-fit: contain; margin-bottom: 0.5rem;" />
          <h1 style="font-size: 1.55rem; font-weight: 800;">Caderneta do Bebê — Passaporte da Cidadania</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.4rem;">
            Autentique-se via <strong>Google SSO</strong>. Sua conta de usuário é criada automaticamente a partir da sua conta Google e todos os registros da <strong>Caderneta da Criança (5ª Edição — MS)</strong> e da rotina automatizada ficam isolados por usuário.
          </p>
        </div>

        <!-- Botão Oficial Renderizado pelo Google Identity Services (OIDC ID Token + One Tap) -->
        <div style="display: flex; justify-content: center; margin-bottom: 1rem; min-height: 44px;">
          <div #googleBtnContainer></div>
        </div>

        <!-- Botão Direto Google OAuth 2.0 SSO Popup (initTokenClient) -->
        <div class="card-elevated" style="text-align: center; padding: 1.25rem;">
          <button
            type="button"
            class="btn btn-sleep"
            style="width: 100%; font-size: 0.96rem; padding: 0.85rem 1.2rem;"
            [disabled]="isLoading()"
            (click)="signInWithGoogleSsoPopup()">
            <span aria-hidden="true">🌐</span>
            <span>{{ isLoading() ? 'Autenticando via Google SSO...' : 'Continuar com o Google (SSO)' }}</span>
          </button>

          @if (!authService.googleClientId() && authService.allowClientIdConfig()) {
            <p style="font-size: 0.8rem; color: var(--cat-milestone); margin-top: 0.75rem; font-weight: 600;">
              ⚠️ Configure o seu Google OAuth 2.0 Client ID abaixo (ou em <code>appsettings.json</code> / variável <code>GOOGLE_CLIENT_ID</code>) para habilitar o popup do Google SSO.
            </p>
          }
        </div>

        <!-- Configuração do Google Cloud OAuth 2.0 Client ID (Exibida apenas quando GOOGLE_CLIENT_ID não está definido no ambiente) -->
        @if (authService.allowClientIdConfig()) {
          <div style="margin-top: 1.25rem; text-align: center;">
            <button
              type="button"
              class="btn"
              style="min-height: 32px; font-size: 0.76rem; padding: 0.3rem 0.75rem;"
              (click)="showClientIdConfig.set(!showClientIdConfig())">
              ⚙️ Configurar Google OAuth 2.0 Client ID
            </button>

            @if (showClientIdConfig() || !authService.googleClientId()) {
              <div class="card-elevated" style="margin-top: 0.75rem; text-align: left;">
                <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">
                  Google Cloud OAuth 2.0 Client ID:
                </label>
                <div style="display: flex; gap: 0.5rem;">
                  <input
                    type="text"
                    class="input-field"
                    [(ngModel)]="clientIdInput"
                    placeholder="seu-client-id.apps.googleusercontent.com" />
                  <button type="button" class="btn btn-diaper" (click)="saveClientId()">Salvar</button>
                </div>
                <p style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.4rem;">
                  Em Google Cloud Console → APIs &amp; Services → Credentials, adicione <code>http://localhost:4200</code> em <em>Authorized JavaScript origins</em>.
                </p>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `
})
export class GoogleLoginComponent implements AfterViewInit {
  readonly authService = inject(AuthService);
  readonly routineStore = inject(RoutineStore);
  private readonly popupAlert = inject(PopupAlertService);

  @ViewChild('googleBtnContainer') googleBtnContainer?: ElementRef<HTMLDivElement>;
  @Output() readonly loggedIn = new EventEmitter<void>();

  readonly isLoading = signal(false);
  readonly showClientIdConfig = signal(false);
  clientIdInput = '';

  async ngAfterViewInit(): Promise<void> {
    const serverClientId = await this.authService.loadServerSsoConfig();
    this.clientIdInput = serverClientId;
    this.waitForGoogleScriptAndRender();
  }

  async signInWithGoogleSsoPopup(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.authService.signInWithGoogleOAuthPopup();
      await this.routineStore.initialize();
      this.loggedIn.emit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação Google SSO.';
      this.popupAlert.error(msg, 'Erro de Autenticação Google SSO', { skipHistory: true });
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveClientId(): Promise<void> {
    if (!this.clientIdInput.trim()) {
      this.popupAlert.incompleteForm('Informe o Google Cloud OAuth 2.0 Client ID antes de salvar.');
      return;
    }
    await this.authService.setGoogleClientId(this.clientIdInput);
    this.tryRenderOfficialGoogleButton();
  }

  private waitForGoogleScriptAndRender(attempt = 0): void {
    if (typeof window === 'undefined') return;
    if (window.google?.accounts?.id) {
      this.tryRenderOfficialGoogleButton();
    } else if (attempt < 20) {
      setTimeout(() => this.waitForGoogleScriptAndRender(attempt + 1), 250);
    }
  }

  private tryRenderOfficialGoogleButton(): void {
    if (typeof window === 'undefined' || !this.googleBtnContainer?.nativeElement) return;
    const g = window.google?.accounts?.id;
    const clientId = this.authService.googleClientId();
    if (g && clientId) {
      try {
        this.googleBtnContainer.nativeElement.innerHTML = '';
        g.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async (response: { credential: string }) => {
            this.isLoading.set(true);
            try {
              await this.authService.signInWithGoogleCredential(response.credential);
              await this.routineStore.initialize();
              this.loggedIn.emit();
            } catch {
              this.popupAlert.error(
                'Falha ao validar a credencial de autenticação no servidor.',
                'Erro de Autenticação',
                { skipHistory: true }
              );
            } finally {
              this.isLoading.set(false);
            }
          }
        });
        g.renderButton(this.googleBtnContainer.nativeElement, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 320
        });
        g.prompt();
      } catch { }
    }
  }
}
