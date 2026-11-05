import { Component, OnInit, inject } from '@angular/core';
import { MilestoneTimelineTreeComponent } from './components/milestone-timeline-tree/milestone-timeline-tree.component';
import { BabyStore } from '../../core/state/baby.store';
import { RoutineStore } from '../../core/state/routine.store';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';

@Component({
  selector: 'app-milestones',
  standalone: true,
  imports: [MilestoneTimelineTreeComponent],
  template: `
    <app-milestone-timeline-tree />
  `
})
export class MilestonesComponent implements OnInit {
  private readonly babyStore = inject(BabyStore);
  private readonly routineStore = inject(RoutineStore);
  private readonly loadingOverlay = inject(LoadingOverlayService);

  async ngOnInit(): Promise<void> {
    const babyId = this.babyStore.selectedBabyId();
    if (babyId) {
      await this.loadingOverlay.runWithLoading(
        () => this.routineStore.refreshMilestones(babyId),
        'Carregando marcos do desenvolvimento...'
      );
    }
  }
}
