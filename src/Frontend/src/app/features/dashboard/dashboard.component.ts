import { Component, OnInit, inject } from '@angular/core';
import { WakeWindowWidgetComponent } from '../../shared/components/wake-window-widget/wake-window-widget.component';
import { DailySummaryCardsComponent } from './components/daily-summary-cards/daily-summary-cards.component';
import { TimelineFeedComponent } from './components/timeline-feed/timeline-feed.component';
import { BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    WakeWindowWidgetComponent,
    DailySummaryCardsComponent,
    TimelineFeedComponent
  ],
  template: `
    <div style="display: flex; flex-direction: column; gap: var(--space-5);">
      <app-wake-window-widget />
      <app-daily-summary-cards />
      <app-timeline-feed />
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly babyStore = inject(BabyStore);
  private readonly routineStore = inject(RoutineStore);
  private readonly loadingOverlay = inject(LoadingOverlayService);

  async ngOnInit(): Promise<void> {
    const babyId = this.babyStore.selectedBabyId();
    if (babyId) {
      await this.loadingOverlay.runWithLoading(
        () => this.routineStore.refreshDashboard(babyId),
        'Carregando rotina diária do bebê...'
      );
    }
  }
}
