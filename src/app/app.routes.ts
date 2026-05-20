import { Routes } from '@angular/router';
import { MapDemoComponent } from './pages/map-demo/map-demo.component';

export const routes: Routes = [
  { path: '', component: MapDemoComponent },
  { path: '**', redirectTo: '' },
];
