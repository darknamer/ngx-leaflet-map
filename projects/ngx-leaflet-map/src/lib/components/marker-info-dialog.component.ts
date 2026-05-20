import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MapMarker } from '../models/map.models';

export interface MarkerInfoDialogData {
  marker: MapMarker;
}

@Component({
  selector: 'ngx-marker-info-dialog',
  standalone: true,
  imports: [DecimalPipe, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.marker.title || 'Marker' }}</h2>
    <mat-dialog-content>
      @if (data.marker.description) {
        <p>{{ data.marker.description }}</p>
      }
      <p class="coords">
        {{ data.marker.position.lat | number: '1.4-6' }},
        {{ data.marker.position.lng | number: '1.4-6' }}
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: `
    .coords {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
      margin: 0;
    }
  `,
})
export class MarkerInfoDialogComponent {
  readonly data = inject<MarkerInfoDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MarkerInfoDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
