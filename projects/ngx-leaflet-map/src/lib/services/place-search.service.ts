import { inject, Injectable } from '@angular/core';
import { PlaceSearchResult } from '../models/map.models';
import { NGX_LEAFLET_MAP_CONFIG } from '../tokens/ngx-leaflet-map-config.token';
import { getGoogleMapsGlobal } from './google-maps-global';

export abstract class PlaceSearchService {
  abstract search(query: string): Promise<PlaceSearchResult[]>;
}

@Injectable()
export class NominatimPlaceSearchService extends PlaceSearchService {
  async search(query: string): Promise<PlaceSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', trimmed);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '0');
    url.searchParams.set('limit', '8');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Nominatim search failed (${response.status})`);
    }

    const data = (await response.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      place_id: number;
    }>;

    return data.map((item) => ({
      displayName: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      placeId: String(item.place_id),
    }));
  }
}

@Injectable()
export class GooglePlacesSearchService extends PlaceSearchService {
  private readonly config = inject(NGX_LEAFLET_MAP_CONFIG);
  private loadPromise?: Promise<void>;

  async search(query: string): Promise<PlaceSearchResult[]> {
    const trimmed = query.trim();
    const apiKey = this.config.googlePlacesApiKey;
    if (!trimmed || !apiKey) {
      return [];
    }

    await this.ensureGoogleMapsLoaded(apiKey);
    const googleMaps = getGoogleMapsGlobal();
    if (!googleMaps) {
      return [];
    }

    const service = new googleMaps.maps.places.AutocompleteService();

    return new Promise((resolve) => {
      service.getPlacePredictions({ input: trimmed }, (predictions, status) => {
        if (
          status !== googleMaps.maps.places.PlacesServiceStatus.OK ||
          !predictions?.length
        ) {
          resolve([]);
          return;
        }

        const geocoder = new googleMaps.maps.Geocoder();
        const results: PlaceSearchResult[] = [];
        let pending = Math.min(predictions.length, 8);

        predictions.slice(0, 8).forEach((prediction) => {
          if (!prediction.place_id) {
            pending -= 1;
            if (pending === 0) {
              resolve(results);
            }
            return;
          }

          geocoder.geocode({ placeId: prediction.place_id }, (geoResults, geoStatus) => {
            pending -= 1;
            if (
              geoStatus === googleMaps.maps.GeocoderStatus.OK &&
              geoResults?.[0]?.geometry?.location
            ) {
              const location = geoResults[0].geometry.location;
              results.push({
                displayName: prediction.description,
                lat: location.lat(),
                lng: location.lng(),
                placeId: prediction.place_id,
              });
            }
            if (pending === 0) {
              resolve(results);
            }
          });
        });
      });
    });
  }

  private ensureGoogleMapsLoaded(apiKey: string): Promise<void> {
    if (getGoogleMapsGlobal()?.maps?.places) {
      return Promise.resolve();
    }

    if (!this.loadPromise) {
      this.loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API'));
        document.head.appendChild(script);
      });
    }

    return this.loadPromise;
  }
}
