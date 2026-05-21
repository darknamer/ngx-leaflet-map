import { DecimalPipe } from '@angular/common';
import { Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  MapMarker,
  NgxLeafletMapComponent,
  NgxLeafletMapSearchComponent,
  PlaceSearchResult,
} from 'ngx-leaflet-map';

@Component({
  selector: 'app-map-demo',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatSlideToggleModule,
    NgxLeafletMapComponent,
    NgxLeafletMapSearchComponent,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>ngx-leaflet-map demo</span>
    </mat-toolbar>

    <main class="page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Leaflet + Angular Material</mat-card-title>
          <mat-card-subtitle>
            Click the map to add markers, click a marker for a dialog, or search for a place.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="controls-row">
            <ngx-leaflet-map-search
              #search
              class="search"
              (placeSelected)="onPlaceSelected($event)"
            />
            <mat-slide-toggle [(ngModel)]="allowAddMarker" labelPosition="before">
              Allow adding markers
            </mat-slide-toggle>
          </div>

          <ngx-leaflet-map
            #mapRef
            class="map"
            [markers]="markers()"
            [allowAddMarker]="allowAddMarker"
            [showSearch]="false"
            height="520px"
            (markerAdded)="onMarkerAdded($event)"
          />
        </mat-card-content>
      </mat-card>

      <mat-card class="marker-list">
        <mat-card-header>
          <mat-card-title>Markers ({{ markers().length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (markers().length === 0) {
            <p>No markers yet. Search a place or click the map.</p>
          } @else {
            <ul>
              @for (marker of markers(); track marker.id) {
                <li>
                  <strong>{{ marker.title }}</strong>
                  — {{ marker.position.lat | number: '1.4-4' }},
                  {{ marker.position.lng | number: '1.4-4' }}
                </li>
              }
            </ul>
          }
        </mat-card-content>
      </mat-card>
    </main>
  `,
  styles: `
    .page {
      display: grid;
      gap: 16px;
      margin: 0 auto;
      max-width: 1100px;
      padding: 16px;
    }

    .controls-row {
      align-items: center;
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }

    .search {
      flex: 1;
    }

    .map {
      display: block;
      margin-top: 16px;
    }

    .marker-list ul {
      margin: 0;
      padding-left: 1.25rem;
    }
  `,
})
export class MapDemoComponent {
  protected allowAddMarker = true;
  protected readonly mapRef = viewChild.required<NgxLeafletMapComponent>('mapRef');
  protected readonly markers = signal<MapMarker[]>([
    {
      id: 'demo-grand-palace',
      position: { lat: 13.75, lng: 100.4915 },
      title: 'Grand Palace',
      description: 'Example marker — click to open Material dialog',
    },
  ]);

  onPlaceSelected(place: PlaceSearchResult): void {
    this.mapRef().onPlaceSelected(place);
  }

  onMarkerAdded(marker: MapMarker): void {
    this.markers.update((list) => [...list, marker]);
  }
}
