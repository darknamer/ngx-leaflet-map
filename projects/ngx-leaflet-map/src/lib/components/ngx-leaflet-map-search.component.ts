import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlaceSearchResult } from '../models/map.models';
import { PlaceSearchService } from '../services/place-search.service';

@Component({
  selector: 'ngx-leaflet-map-search',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-form-field class="search-field" appearance="outline" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      <!-- <mat-icon matPrefix>search</mat-icon> -->
      <input
        matInput
        type="search"
        [placeholder]="placeholder()"
        [(ngModel)]="query"
        (ngModelChange)="onQueryChange($event)"
        [matAutocomplete]="auto"
      />
      @if (loading()) {
        <mat-spinner matSuffix diameter="20" />
      }
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="onPlaceSelected($event.option.value)"
      >
        @for (place of results(); track place.placeId ?? place.displayName) {
          <mat-option [value]="place">{{ place.displayName }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .search-field {
      width: 100%;
    }
  `,
})
export class NgxLeafletMapSearchComponent {
  private readonly placeSearch = inject(PlaceSearchService);

  readonly label = input('Search places');
  readonly placeholder = input('City, address, landmark…');
  readonly debounceMs = input(350);

  readonly placeSelected = output<PlaceSearchResult>();

  protected query = '';
  protected readonly results = signal<PlaceSearchResult[]>([]);
  protected readonly loading = signal(false);

  private debounceTimer?: ReturnType<typeof setTimeout>;

  onQueryChange(value: string): void {
    clearTimeout(this.debounceTimer);
    const trimmed = value.trim();
    if (!trimmed) {
      this.results.set([]);
      return;
    }

    this.debounceTimer = setTimeout(() => void this.runSearch(trimmed), this.debounceMs());
  }

  onPlaceSelected(place: PlaceSearchResult): void {
    this.query = place.displayName;
    this.results.set([]);
    this.placeSelected.emit(place);
  }

  private async runSearch(query: string): Promise<void> {
    this.loading.set(true);
    try {
      this.results.set(await this.placeSearch.search(query));
    } catch {
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
