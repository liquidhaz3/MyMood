import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MoodService } from '../../services/mood.service';
import { MoodEntry } from '../../models/mood.model';

@Component({
  selector: 'app-mood-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-history.component.html',
  styleUrl: './mood-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoodHistoryComponent {
  private readonly moodService = inject(MoodService);
  private readonly router = inject(Router);

  readonly entries = this.moodService.entries;
  readonly availableMoods = this.moodService.availableMoods;
  selectedFilter: string = 'all';

  editingEntryId: string | null = null;
  editMoodId: string = '';
  editNote: string = '';

  readonly filteredEntries = computed(() => {
    const allEntries = this.entries();
    const now = new Date();

    switch (this.selectedFilter) {
      case 'today':
        return allEntries.filter(entry =>
          entry.date.toDateString() === now.toDateString()
        );
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return allEntries.filter(entry => entry.date >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return allEntries.filter(entry => entry.date >= monthAgo);
      default:
        return allEntries;
    }
  });

  readonly averageMood = computed(() => {
    const filtered = this.filteredEntries();
    if (filtered.length === 0) return 'Brak danych';

    const moodValues = filtered.map(entry => {
      const mood = this.getMoodById(entry.moodId);
      return mood?.value || 0;
    });

    const average = moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length;
    return Math.round(average * 10) / 10;
  });

  getMoodById(id: string) {
    return this.moodService.getMoodById(id);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  editEntry(entry: MoodEntry): void {
    this.editingEntryId = entry.id;
    this.editMoodId = entry.moodId;
    this.editNote = entry.note ?? '';
  }

  cancelEdit(): void {
    this.editingEntryId = null;
    this.editMoodId = '';
    this.editNote = '';
  }

  saveEdit(): void {
    if (!this.editingEntryId || !this.editMoodId) return;
    const confirmed = confirm('Zapisać zmiany w wpisie?');
    if (!confirmed) return;
    this.moodService.updateMoodEntry(this.editingEntryId, {
      moodId: this.editMoodId,
      note: this.editNote || undefined
    });
    this.cancelEdit();
  }

  deleteEntry(id: string): void {
    if (confirm('Czy na pewno chcesz usunąć ten wpis?')) {
      this.moodService.deleteMoodEntry(id);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToAddMood(): void {
    this.router.navigate(['/add-mood']);
  }

  deleteAllEntries(): void {
    const confirmed = confirm('Czy na pewno chcesz usunąć WSZYSTKIE wpisy? Ta operacja jest nieodwracalna!');
    if (confirmed) {
      const allEntries = this.entries();
      allEntries.forEach(entry => {
        this.moodService.deleteMoodEntry(entry.id);
      });
    }
  }
}
