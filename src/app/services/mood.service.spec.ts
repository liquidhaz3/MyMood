import { TestBed } from '@angular/core/testing';
import { MoodService } from './mood.service';

describe('MoodService', () => {
  let service: MoodService;

  const STORAGE_KEY = 'mood-entries';
  const MOODS_KEY = 'mood-definitions';

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MOODS_KEY);

    TestBed.configureTestingModule({});
    service = TestBed.inject(MoodService);
  });

  it('should initialize default moods when none stored', () => {
    const stored = localStorage.getItem(MOODS_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored as string);
    expect(Array.isArray(parsed)).toBeTrue();
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('should add a mood entry and persist it', () => {
    const moods = service.availableMoods();
    const moodId = moods[0].id;

    expect(service.entries().length).toBe(0);
    service.addMoodEntry(moodId, 'nota');

    const entries = service.entries();
    expect(entries.length).toBe(1);
    expect(entries[0].moodId).toBe(moodId);

    const persisted = localStorage.getItem(STORAGE_KEY);
    expect(persisted).toBeTruthy();
    const parsed = JSON.parse(persisted as string);
    expect(parsed.length).toBe(1);
  });

  it('should update an existing mood entry', () => {
    const moodId = service.availableMoods()[0].id;
    service.addMoodEntry(moodId, 'old');
    const entry = service.entries()[0];

    service.updateMoodEntry(entry.id, { note: 'new' });
    const updated = service.entries()[0];
    expect(updated.note).toBe('new');
  });

  it('should delete an entry', () => {
    const moodId = service.availableMoods()[0].id;
    service.addMoodEntry(moodId);
    const entry = service.entries()[0];

    service.deleteMoodEntry(entry.id);
    expect(service.entries().length).toBe(0);
  });

  it('should compute stats including average and most common', () => {
    const [m1, m2] = service.availableMoods();
    service.addMoodEntry(m1.id);
    service.addMoodEntry(m2.id);
    service.addMoodEntry(m2.id);

    const stats = service.stats();
    expect(stats.totalEntries).toBe(3);
    expect(typeof stats.averageMood).toBe('number');
    expect(stats.mostCommonMood.length).toBeGreaterThan(0);
  });
});



