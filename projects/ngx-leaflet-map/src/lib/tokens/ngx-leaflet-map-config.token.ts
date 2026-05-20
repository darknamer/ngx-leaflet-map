import { InjectionToken } from '@angular/core';
import { NgxLeafletMapConfig } from '../models/map.models';

export const NGX_LEAFLET_MAP_CONFIG = new InjectionToken<NgxLeafletMapConfig>(
  'NGX_LEAFLET_MAP_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);
