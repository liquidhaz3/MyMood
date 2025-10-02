export interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
  value: number;
}

export interface MoodEntry {
  id: string;
  moodId: string;
  date: Date;
  note?: string;
}

export interface MoodStats {
  totalEntries: number;
  averageMood: number;
  mostCommonMood: string;
  moodTrend: 'improving' | 'declining' | 'stable';
}
