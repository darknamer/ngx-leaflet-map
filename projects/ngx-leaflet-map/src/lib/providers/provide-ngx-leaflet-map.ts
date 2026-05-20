import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NgxLeafletMapConfig } from '../models/map.models';
import {
  GooglePlacesSearchService,
  NominatimPlaceSearchService,
  PlaceSearchService,
} from '../services/place-search.service';
import { NGX_LEAFLET_MAP_CONFIG } from '../tokens/ngx-leaflet-map-config.token';

export function provideNgxLeafletMap(
  config: NgxLeafletMapConfig = {},
): EnvironmentProviders {
  const useGoogle =
    config.geocodingProvider === 'google' || Boolean(config.googlePlacesApiKey);

  return makeEnvironmentProviders([
    { provide: NGX_LEAFLET_MAP_CONFIG, useValue: config },
    {
      provide: PlaceSearchService,
      useClass: useGoogle ? GooglePlacesSearchService : NominatimPlaceSearchService,
    },
  ]);
}
