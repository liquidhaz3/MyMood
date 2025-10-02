import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MoodService } from '../../services/mood.service';
import { ThemeService } from '../../services/theme.service';
import { MoodEntry } from '../../models/mood.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly moodService = inject(MoodService);
  private readonly themeService = inject(ThemeService);

  readonly stats = this.moodService.stats;
  readonly availableMoods = this.moodService.availableMoods;
  readonly recentEntries = this.moodService.recentEntries;
  readonly isDark = this.themeService.isDark;

  addQuickMood(moodId: string): void {
    this.moodService.addMoodEntry(moodId);
  }

  getMoodById(id: string) {
    return this.moodService.getMoodById(id);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  resetMoodDefinitions(): void {
    if (confirm('Czy na pewno chcesz zresetować definicje nastrojów do domyślnych? To nie wpłynie na Twoje wpisy.')) {
      this.moodService.resetMoodDefinitions();
    }
  }
}
