import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideNgxLeafletMap } from 'ngx-leaflet-map';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(routes),
    provideNgxLeafletMap({
      defaultCenter: { lat: 13.7563, lng: 100.5018 },
      defaultZoom: 12,
      geocodingProvider: 'nominatim',
      // googlePlacesApiKey: 'YOUR_GOOGLE_API_KEY',
      // geocodingProvider: 'google',
    }),
  ],
};
