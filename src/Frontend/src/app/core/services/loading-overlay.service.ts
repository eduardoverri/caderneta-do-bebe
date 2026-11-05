import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingOverlayService {
  private readonly activeCount = signal<number>(0);
  private readonly currentMessage = signal<string>('Carregando dados...');

  /** Indica se há alguma carga de dados em andamento bloqueando a tela */
  readonly isLoading = computed<boolean>(() => this.activeCount() > 0);

  /** Mensagem contextual exibida no overlay */
  readonly message = this.currentMessage.asReadonly();

  /**
   * Exibe o loading overlay bloqueando a tela com a mensagem informada
   */
  show(message = 'Carregando dados...'): void {
    this.currentMessage.set(message);
    this.activeCount.update(c => c + 1);
  }

  /**
   * Oculta o loading overlay (decrementa o contador de requisições ativas)
   */
  hide(): void {
    this.activeCount.update(c => Math.max(0, c - 1));
  }

  /**
   * Executa uma ação assíncrona garantindo a exibição do loading overlay
   * bloqueando a tela até a conclusão, mantendo tempo mínimo de 250ms para evitar flickering.
   */
  async runWithLoading<T>(
    action: () => Promise<T>,
    message = 'Carregando dados...'
  ): Promise<T> {
    this.show(message);
    const start = Date.now();
    try {
      return await action();
    } finally {
      const elapsed = Date.now() - start;
      const minDisplayMs = 250;
      if (elapsed < minDisplayMs) {
        await new Promise(resolve => setTimeout(resolve, minDisplayMs - elapsed));
      }
      this.hide();
    }
  }
}

