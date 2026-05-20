export interface GooglePlacePrediction {
  description: string;
  place_id?: string;
}

export interface GoogleMapsGlobal {
  maps: {
    places: {
      PlacesServiceStatus: { OK: string };
      AutocompleteService: new () => {
        getPlacePredictions: (
          request: { input: string },
          callback: (
            predictions: GooglePlacePrediction[] | null,
            status: string,
          ) => void,
        ) => void;
      };
    };
    Geocoder: new () => {
      geocode: (
        request: { placeId: string },
        callback: (
          results: Array<{ geometry: { location: { lat(): number; lng(): number } } }> | null,
          status: string,
        ) => void,
      ) => void;
    };
    GeocoderStatus: { OK: string };
  };
}

export function getGoogleMapsGlobal(): GoogleMapsGlobal | undefined {
  return (globalThis as { google?: GoogleMapsGlobal }).google;
}
