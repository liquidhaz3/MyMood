import { Injectable, signal, computed } from '@angular/core';
import { Mood, MoodEntry, MoodStats } from '../models/mood.model';

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private readonly STORAGE_KEY = 'mood-entries';
  private readonly MOODS_KEY = 'mood-definitions';
  private readonly MOODS_VERSION_KEY = 'mood-definitions-version';
  private readonly MOODS_VERSION = 2;

  private readonly defaultMoods: Mood[] = [
    { id: '1', name: 'Smutny', emoji: '😢', color: '#32aff3', value: 1 },
    { id: '2', name: 'Zły', emoji: '😠', color: '#ff1d34', value: 2 },
    { id: '3', name: 'Przestraszony', emoji: '😨', color: '#b3b3b3', value: 3 },
    { id: '4', name: 'Zaskoczony', emoji: '😮', color: '#ff961e', value: 4 },
    { id: '5', name: 'Radosny', emoji: '😄', color: '#2ed573', value: 5 }
  ];

  private moodEntries = signal<MoodEntry[]>(this.loadEntries());
  private moods = signal<Mood[]>(this.loadMoods());

  public readonly entries = this.moodEntries.asReadonly();
  public readonly availableMoods = this.moods.asReadonly();

  public readonly stats = computed(() => this.calculateStats());
  public readonly recentEntries = computed(() =>
    this.moodEntries().slice(-7).reverse()
  );

  constructor() {
    this.initializeMoods();
    this.moods.set(this.loadMoods());
  }

  addMoodEntry(moodId: string, note?: string): void {
    const newEntry: MoodEntry = {
      id: this.generateId(),
      moodId,
      date: new Date(),
      note
    };

    const currentEntries = this.moodEntries();
    this.moodEntries.set([...currentEntries, newEntry]);
    this.saveEntries();
  }

  updateMoodEntry(id: string, updates: Partial<MoodEntry>): void {
    const currentEntries = this.moodEntries();
    const updatedEntries = currentEntries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    this.moodEntries.set(updatedEntries);
    this.saveEntries();
  }

  deleteMoodEntry(id: string): void {
    const currentEntries = this.moodEntries();
    const filteredEntries = currentEntries.filter(entry => entry.id !== id);
    this.moodEntries.set(filteredEntries);
    this.saveEntries();
  }

  getMoodById(id: string): Mood | undefined {
    return this.moods().find(mood => mood.id === id);
  }

  getEntriesByDateRange(startDate: Date, endDate: Date): MoodEntry[] {
    return this.moodEntries().filter(entry =>
      entry.date >= startDate && entry.date <= endDate
    );
  }

  private calculateStats(): MoodStats {
    const entries = this.moodEntries();
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        mostCommonMood: '',
        moodTrend: 'stable'
      };
    }

    const moodValues = entries.map(entry => {
      const mood = this.getMoodById(entry.moodId);
      return mood?.value || 0;
    });

    const totalEntries = entries.length;
    const averageMood = moodValues.reduce((sum, value) => sum + value, 0) / totalEntries;

    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.moodId] = (acc[entry.moodId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonMoodId = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    const mostCommonMood = this.getMoodById(mostCommonMoodId)?.name || '';

    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(-14, -7);

    let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentEntries.length > 0 && olderEntries.length > 0) {
      const recentAvg = recentEntries.reduce((sum, entry) => {
        const mood = this.getMoodById(entry.moodId);
        return sum + (mood?.value || 0);
      }, 0) / recentEntries.length;

      const olderAvg = olderEntries.reduce((sum, entry) => {
        const mood = this.getMoodById(entry.moodId);
        return sum + (mood?.value || 0);
      }, 0) / olderEntries.length;

      if (recentAvg > olderAvg + 0.5) moodTrend = 'improving';
      else if (recentAvg < olderAvg - 0.5) moodTrend = 'declining';
    }

    return {
      totalEntries,
      averageMood: Math.round(averageMood * 10) / 10,
      mostCommonMood,
      moodTrend
    };
  }

  private generateId(): string {
    try {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
      }
    } catch {
    }

    const timePart = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `${timePart}-${randomPart}`;
  }

  private loadEntries(): MoodEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
    return [];
  }

  private loadMoods(): Mood[] {
    try {
      const stored = localStorage.getItem(this.MOODS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading moods:', error);
    }
    return this.defaultMoods;
  }

  private saveEntries(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.moodEntries()));
    } catch (error) {
      console.error('Error saving mood entries:', error);
    }
  }

  private initializeMoods(): void {
    const storedVersionRaw = localStorage.getItem(this.MOODS_VERSION_KEY);
    const storedVersion = storedVersionRaw ? Number(storedVersionRaw) : 0;
    const storedMoods = localStorage.getItem(this.MOODS_KEY);

    if (!storedMoods || Number.isNaN(storedVersion) || storedVersion < this.MOODS_VERSION) {
      localStorage.setItem(this.MOODS_KEY, JSON.stringify(this.defaultMoods));
      localStorage.setItem(this.MOODS_VERSION_KEY, String(this.MOODS_VERSION));
    }
  }

  resetMoodDefinitions(): void {
    localStorage.setItem(this.MOODS_KEY, JSON.stringify(this.defaultMoods));
    localStorage.setItem(this.MOODS_VERSION_KEY, String(this.MOODS_VERSION));
    this.moods.set(this.defaultMoods);
  }
}

