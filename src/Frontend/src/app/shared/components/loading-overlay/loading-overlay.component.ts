import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { LoadingOverlayService } from '../../../core/services/loading-overlay.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  template: `
    <dialog
      #dialogRef
      class="loading-overlay-dialog"
      aria-labelledby="loading-title"
      aria-describedby="loading-desc"
      aria-busy="true"
      closedby="none"
      (cancel)="$event.preventDefault()">
      <div class="loading-overlay-card">
        <div class="loading-spinner-wrapper" aria-hidden="true">
          <div class="loading-spinner"></div>
          <span class="loading-baby-icon">👶</span>
        </div>

        <h2 id="loading-title" class="loading-title">Carregando Dados</h2>
        <p id="loading-desc" class="loading-message">{{ loadingService.message() }}</p>

        <div class="loading-pulse-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </dialog>
  `,
  styleUrl: './loading-overlay.component.css'
})
export class LoadingOverlayComponent {
  readonly loadingService = inject(LoadingOverlayService);
  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');

  constructor() {
    effect(() => {
      const isVisible = this.loadingService.isLoading();
      const el = this.dialogRef()?.nativeElement;
      if (!el) return;

      if (isVisible) {
        if (!el.open) {
          try {
            el.showModal();
          } catch {
            // Caso já esteja aberto
          }
        }
      } else {
        if (el.open) {
          try {
            el.close();
          } catch {
            // Caso já esteja fechado
          }
        }
      }
    });
  }
}

