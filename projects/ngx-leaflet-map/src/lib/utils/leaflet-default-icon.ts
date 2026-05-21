import * as L from 'leaflet';

/** Fixes broken default marker icons when bundling Leaflet with Angular. */
export function configureLeafletDefaultIcon(): void {
  const iconRetinaUrl =
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
  const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
  const shadowUrl =
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

  // Prevent webpack from intercepting the URLs via its asset pipeline
  delete (L.Icon.Default.prototype as any)['_getIconUrl'];

  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
}
