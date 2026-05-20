import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';
import {
  LatLng,
  MapClickEvent,
  MapMarker,
  MarkerClickEvent,
  PlaceSearchResult,
} from '../models/map.models';
import { NGX_LEAFLET_MAP_CONFIG } from '../tokens/ngx-leaflet-map-config.token';
import { configureLeafletDefaultIcon } from '../utils/leaflet-default-icon';
import { MarkerInfoDialogComponent } from './marker-info-dialog.component';
import { NgxLeafletMapSearchComponent } from './ngx-leaflet-map-search.component';

@Component({
  selector: 'ngx-leaflet-map',
  standalone: true,
  imports: [NgxLeafletMapSearchComponent],
  template: `
    <div class="map-shell" [style.height]="height()">
      @if (showSearch()) {
        <div class="map-search-overlay">
          <ngx-leaflet-map-search
            (placeSelected)="onPlaceSelected($event)"
          />
        </div>
      }
      <div #mapHost class="map-host"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .map-shell {
      position: relative;
      width: 100%;
    }

    .map-host {
      height: 100%;
      width: 100%;
      z-index: 0;
    }

    .map-search-overlay {
      left: 12px;
      max-width: 420px;
      position: absolute;
      right: 12px;
      top: 12px;
      z-index: 1000;
    }
  `,
})
export class NgxLeafletMapComponent implements AfterViewInit, OnDestroy {
  private readonly config = inject(NGX_LEAFLET_MAP_CONFIG);
  private readonly dialog = inject(MatDialog);

  private readonly mapHost = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');

  readonly center = input<LatLng>(this.config.defaultCenter ?? { lat: 13.7563, lng: 100.5018 });
  readonly zoom = input(this.config.defaultZoom ?? 12);
  readonly markers = input<MapMarker[]>([]);
  readonly height = input('480px');
  readonly showSearch = input(true);
  readonly allowAddMarker = input(true);
  readonly openDialogOnMarkerClick = input(true);

  readonly mapReady = output<L.Map>();
  readonly mapClick = output<MapClickEvent>();
  readonly markerClick = output<MarkerClickEvent>();
  readonly markerAdded = output<MapMarker>();

  private map?: L.Map;
  private tileLayer?: L.TileLayer;
  private readonly leafletMarkers = new Map<string, L.Marker>();

  constructor() {
    effect(() => {
      if (this.map) {
        this.syncMarkers(this.markers());
      }
    });
  }

  ngAfterViewInit(): void {
    configureLeafletDefaultIcon();
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.leafletMarkers.clear();
  }

  flyTo(latlng: LatLng, zoom = this.zoom()): void {
    this.map?.flyTo([latlng.lat, latlng.lng], zoom);
  }

  addMarker(marker: MapMarker): void {
    if (!this.map) {
      return;
    }
    this.upsertLeafletMarker(marker);
  }

  onPlaceSelected(place: PlaceSearchResult): void {
    this.flyTo({ lat: place.lat, lng: place.lng }, 15);
    if (this.allowAddMarker()) {
      const marker: MapMarker = {
        id: place.placeId ?? crypto.randomUUID(),
        position: { lat: place.lat, lng: place.lng },
        title: place.displayName,
        description: 'Added from search',
      };
      this.addMarker(marker);
      this.markerAdded.emit(marker);
    }
  }

  private initMap(): void {
    const host = this.mapHost().nativeElement;
    const center = this.center();

    this.map = L.map(host, {
      center: [center.lat, center.lng],
      zoom: this.zoom(),
    });

    const tileUrl =
      this.config.tileLayerUrl ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution =
      this.config.tileLayerAttribution ??
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    this.tileLayer = L.tileLayer(tileUrl, { attribution }).addTo(this.map);
    this.mapReady.emit(this.map);

    this.syncMarkers(this.markers());

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const latlng = { lat: event.latlng.lat, lng: event.latlng.lng };
      this.mapClick.emit({ latlng });

      if (this.allowAddMarker()) {
        const marker: MapMarker = {
          id: crypto.randomUUID(),
          position: latlng,
          title: 'New marker',
          description: 'Click marker to view details',
        };
        this.addMarker(marker);
        this.markerAdded.emit(marker);
      }
    });
  }

  private syncMarkers(markers: MapMarker[]): void {
    if (!this.map) {
      return;
    }

    const nextIds = new Set(markers.map((m) => m.id));
    for (const [id, leafletMarker] of this.leafletMarkers) {
      if (!nextIds.has(id)) {
        leafletMarker.remove();
        this.leafletMarkers.delete(id);
      }
    }

    markers.forEach((marker) => this.upsertLeafletMarker(marker));
  }

  private upsertLeafletMarker(marker: MapMarker): void {
    if (!this.map) {
      return;
    }

    const existing = this.leafletMarkers.get(marker.id);
    if (existing) {
      existing.setLatLng([marker.position.lat, marker.position.lng]);
      return;
    }

    const leafletMarker = L.marker([marker.position.lat, marker.position.lng], {
      draggable: marker.draggable ?? false,
      title: marker.title,
    }).addTo(this.map);

    leafletMarker.on('click', () => {
      this.markerClick.emit({ marker });
      if (this.openDialogOnMarkerClick()) {
        this.dialog.open(MarkerInfoDialogComponent, {
          width: '400px',
          data: { marker },
        });
      }
    });

    this.leafletMarkers.set(marker.id, leafletMarker);
  }
}
