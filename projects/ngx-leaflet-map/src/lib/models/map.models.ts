export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: LatLng;
  title?: string;
  description?: string;
  draggable?: boolean;
}

export interface PlaceSearchResult {
  displayName: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export type GeocodingProvider = 'nominatim' | 'google';

export interface NgxLeafletMapConfig {
  /** Google Maps JavaScript API key (Places library). */
  googlePlacesApiKey?: string;
  /** Geocoding backend when searching places. */
  geocodingProvider?: GeocodingProvider;
  defaultCenter?: LatLng;
  defaultZoom?: number;
  /** OpenStreetMap tile URL template. */
  tileLayerUrl?: string;
  tileLayerAttribution?: string;
}

export interface MapClickEvent {
  latlng: LatLng;
}

export interface MarkerClickEvent {
  marker: MapMarker;
}
