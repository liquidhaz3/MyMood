import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MoodService } from '../../services/mood.service';

@Component({
  selector: 'app-add-mood',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-mood.component.html',
  styleUrl: './add-mood.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMoodComponent {
  private readonly moodService = inject(MoodService);
  private readonly router = inject(Router);

  readonly availableMoods = this.moodService.availableMoods;

  selectedMoodId: string = '';
  note: string = '';
  showSuccess: boolean = false;

  saveMood(): void {
    if (!this.selectedMoodId) return;

    this.moodService.addMoodEntry(this.selectedMoodId, this.note);

    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
      this.router.navigate(['/']);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

