import { Component, OnInit, inject } from '@angular/core';
import { WakeWindowWidgetComponent } from '../../shared/components/wake-window-widget/wake-window-widget.component';
import { NapStopwatchComponent } from './components/nap-stopwatch/nap-stopwatch.component';
import { TransitionReadinessChartComponent } from './components/transition-readiness-chart/transition-readiness-chart.component';
import { BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';

@Component({
  selector: 'app-sleep-tracker',
  standalone: true,
  imports: [
    WakeWindowWidgetComponent,
    NapStopwatchComponent,
    TransitionReadinessChartComponent
  ],
  template: `
    <app-wake-window-widget />
    <div class="grid-2" style="margin-top: 1rem;">
      <app-nap-stopwatch />
      <app-transition-readiness-chart />
    </div>
  `
})
export class SleepTrackerComponent implements OnInit {
  private readonly babyStore = inject(BabyStore);
  private readonly routineStore = inject(RoutineStore);
  private readonly loadingOverlay = inject(LoadingOverlayService);

  async ngOnInit(): Promise<void> {
    const babyId = this.babyStore.selectedBabyId();
    if (babyId) {
      await this.loadingOverlay.runWithLoading(
        () => this.routineStore.refreshSleep(babyId),
        'Carregando dados de sono do bebê...'
      );
    }
  }
}
