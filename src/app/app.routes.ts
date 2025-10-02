import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddMoodComponent } from './components/add-mood/add-mood.component';
import { MoodHistoryComponent } from './components/mood-history/mood-history.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add-mood', component: AddMoodComponent },
  { path: 'history', component: MoodHistoryComponent },
  { path: '**', redirectTo: '' }
];
