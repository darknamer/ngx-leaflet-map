# @darknamer/ngx-leaflet-map

Angular **standalone** library for embedding [Leaflet](https://leafletjs.com/) maps with Angular Material UI. Supports **Angular 19 / 20 / 21**, marker pins, **MatDialog** on marker click, and place search via Nominatim or Google Places API.

**Live demo:** [https://ngx-leaflet-map.darknamer.com/](https://ngx-leaflet-map.darknamer.com/)

---

## Repository structure

| Path | Description |
|------|-------------|
| `projects/ngx-leaflet-map/` | Library source (`@darknamer/ngx-leaflet-map`) |
| `src/app/pages/map-demo/` | Demo application |
| `dist/ngx-leaflet-map/` | Build output after `npm run build:lib` |

---

## Features

- Leaflet map with OpenStreetMap tiles (configurable URL)
- **Standalone components** — no `NgModule` required
- Marker management: add by clicking the map or selecting a search result
- **Angular Material dialog** on marker click (`MarkerInfoDialogComponent`)
- **Place search** with debounced autocomplete (350 ms default)
  - Default: [Nominatim](https://nominatim.org/) — no API key needed
  - Optional: Google Maps JavaScript API + Places (`googlePlacesApiKey`)
- Reactive via Angular **signals** (`input()`, `output()`, `effect()`)
- Peer dependencies: `@angular/*` and `@angular/material` **>=19 <22**

---

## Development / running the demo

```bash
npm install
npm start          # http://localhost:4200
npm run build:lib  # build library → dist/ngx-leaflet-map
npm run build:all  # build lib + demo app
```

Demo features: Bangkok map with a sample marker, Nominatim search, click-to-add markers, marker dialog, real-time marker list.

See `src/app/pages/map-demo/map-demo.component.ts` for example usage.

---

## Installation

```bash
npm install @darknamer/ngx-leaflet-map leaflet
npm install @angular/material @angular/cdk @angular/animations
```

Match the Angular / Material version to your project (19, 20, or 21).

---

## Setup

### 1. Add Leaflet styles in `angular.json`

```json
"styles": [
  "node_modules/leaflet/dist/leaflet.css",
  "src/styles.scss"
]
```

Recommended — suppress CommonJS warning:

```json
"allowedCommonJsDependencies": ["leaflet"]
```

### 2. Register providers (`app.config.ts`)

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxLeafletMap } from '@darknamer/ngx-leaflet-map';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideNgxLeafletMap({
      defaultCenter: { lat: 13.7563, lng: 100.5018 },
      defaultZoom: 12,
      geocodingProvider: 'nominatim',
    }),
  ],
};
```

`provideNgxLeafletMap()` registers:
- `NGX_LEAFLET_MAP_CONFIG` token (injected by components)
- `PlaceSearchService` — `NominatimPlaceSearchService` by default, or `GooglePlacesSearchService` when a Google API key is supplied

### 3. Use in a component

```typescript
import { Component, signal } from '@angular/core';
import { MapMarker, NgxLeafletMapComponent } from '@darknamer/ngx-leaflet-map';

@Component({
  selector: 'app-my-map',
  standalone: true,
  imports: [NgxLeafletMapComponent],
  template: `
    <ngx-leaflet-map
      [markers]="markers()"
      [allowAddMarker]="true"
      [showSearch]="true"
      height="500px"
      (markerAdded)="markers.update((m) => [...m, $event])"
    />
  `,
})
export class MyMapComponent {
  markers = signal<MapMarker[]>([]);
}
```

---

## API reference

### `provideNgxLeafletMap(config?)`

| Option | Type | Description |
|--------|------|-------------|
| `defaultCenter` | `{ lat: number; lng: number }` | Initial map center |
| `defaultZoom` | `number` | Initial zoom level |
| `geocodingProvider` | `'nominatim' \| 'google'` | Place search backend |
| `googlePlacesApiKey` | `string` | Google Maps JS API key — also switches provider to `'google'` |
| `tileLayerUrl` | `string` | OpenStreetMap tile URL template |
| `tileLayerAttribution` | `string` | Attribution HTML string |

### `<ngx-leaflet-map>`

**Inputs**

| Input | Default | Description |
|-------|---------|-------------|
| `center` | from config or `{ lat: 13.7563, lng: 100.5018 }` | Map center |
| `zoom` | from config or `12` | Zoom level |
| `markers` | `[]` | Array of `MapMarker` — reactive via signal `effect()` |
| `height` | `'480px'` | CSS height of the map container |
| `showSearch` | `true` | Show the search overlay |
| `allowAddMarker` | `true` | Add marker on map click or search selection |
| `openDialogOnMarkerClick` | `true` | Open `MatDialog` on marker click |

**Outputs**

| Output | Payload | Description |
|--------|---------|-------------|
| `mapReady` | `L.Map` | Fired once the Leaflet map is initialized |
| `mapClick` | `MapClickEvent` | Raw map click with `{ latlng }` |
| `markerClick` | `MarkerClickEvent` | Marker clicked — fires before dialog opens |
| `markerAdded` | `MapMarker` | New marker added (map click or search) |
| `placeSelected` | `PlaceSearchResult` | Search result selected (fires before `markerAdded`) |

**Public methods**

| Method | Description |
|--------|-------------|
| `flyTo(latlng, zoom?)` | Animate map to a position |
| `addMarker(marker)` | Programmatically add a marker |

### `<ngx-leaflet-map-search>` (standalone)

Material autocomplete component for place search. Can be used independently outside `<ngx-leaflet-map>`.

**Inputs**

| Input | Default | Description |
|-------|---------|-------------|
| `label` | `'Search places'` | Form field label |
| `placeholder` | `'City, address, landmark…'` | Input placeholder |
| `debounceMs` | `350` | Debounce delay before triggering search |

**Outputs**

| Output | Payload | Description |
|--------|---------|-------------|
| `placeSelected` | `PlaceSearchResult` | Emitted when user selects an autocomplete result |

---

## Models

```typescript
interface LatLng {
  lat: number;
  lng: number;
}

interface MapMarker {
  id: string;
  position: LatLng;
  title?: string;
  description?: string;
  draggable?: boolean;
}

interface PlaceSearchResult {
  displayName: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface MapClickEvent {
  latlng: LatLng;
}

interface MarkerClickEvent {
  marker: MapMarker;
}
```

---

## Google Places API

1. Create an API key in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps JavaScript API** and **Places API**
3. Pass the key to `provideNgxLeafletMap`:

```typescript
provideNgxLeafletMap({
  googlePlacesApiKey: 'YOUR_KEY',
  geocodingProvider: 'google',
});
```

The library loads `maps.googleapis.com/maps/api/js?libraries=places` lazily on the first search. Restrict the key to your domain in the Google Cloud Console.

---

## Architecture

```
projects/ngx-leaflet-map/src/lib/
├── components/
│   ├── ngx-leaflet-map.component.ts        # Main map component
│   ├── ngx-leaflet-map-search.component.ts # Autocomplete search
│   └── marker-info-dialog.component.ts     # MatDialog content
├── services/
│   ├── place-search.service.ts             # Abstract + Nominatim + Google impls
│   └── google-maps-global.ts              # window.google accessor
├── providers/
│   └── provide-ngx-leaflet-map.ts          # provideNgxLeafletMap()
├── models/
│   └── map.models.ts                       # All interfaces and types
├── tokens/
│   └── ngx-leaflet-map-config.token.ts     # NGX_LEAFLET_MAP_CONFIG InjectionToken
└── utils/
    └── leaflet-default-icon.ts             # Fixes Leaflet default icon paths
```

**Key design decisions:**
- Markers are synced via `effect()` — `syncMarkers()` diffs the current `leafletMarkers` Map against the new input array, removing stale markers and upserting new ones.
- `PlaceSearchService` is abstract; `provideNgxLeafletMap()` selects the concrete implementation based on config, so the component never depends on either backend directly.
- Google Maps script is loaded once and cached via a `Promise` to avoid duplicate `<script>` tags.

---

## Publishing

```bash
# Build APF package
npm run build:lib

# Pack for local testing in another project
cd dist/ngx-leaflet-map && npm pack
```

Before publishing:
1. Bump `version` in `projects/ngx-leaflet-map/package.json`
2. `npm publish dist/ngx-leaflet-map --access public`

**Local path dependency (monorepo):**
```json
"dependencies": {
  "@darknamer/ngx-leaflet-map": "file:dist/ngx-leaflet-map"
}
```

---

## Peer dependencies

```json
"@angular/common":   ">=19.0.0 <22.0.0",
"@angular/core":     ">=19.0.0 <22.0.0",
"@angular/forms":    ">=19.0.0 <22.0.0",
"@angular/material": ">=19.0.0 <22.0.0",
"@angular/cdk":      ">=19.0.0 <22.0.0",
"leaflet":           "^1.9.0",
"rxjs":              "^7.8.0"
```

---

## Notes

- **Nominatim usage policy:** Nominatim has a [usage policy](https://operations.osmfoundation.org/policies/nominatim/) — suitable for development and low-traffic use. For production, use Google Places or a self-hosted geocoder.
- **SSR / Angular Universal:** The library uses `document` and `window` directly during map initialization. Wrap in `isPlatformBrowser()` guard if SSR is needed.

---

## License

MIT
