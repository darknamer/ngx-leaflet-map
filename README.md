# ngx-leaflet-map

Angular **standalone** library สำหรับฝังแผนที่ [Leaflet](https://leafletjs.com/) พร้อม Material UI — รองรับ **Angular 19 / 20 / 21**, ปักหมุด, เปิด **MatDialog** เมื่อคลิกหมุด, และค้นหาสถานที่ (Nominatim หรือ Google Places)

---

## สิ่งที่มีใน repo นี้

| ส่วน | คำอธิบาย |
|------|----------|
| `projects/ngx-leaflet-map/` | Library `@darknamer/ngx-leaflet-map` (publish ได้) |
| `src/app/pages/map-demo/` | แอปตัวอย่างการใช้งานจริง |
| `dist/ngx-leaflet-map/` | ผลลัพธ์หลัง `npm run build:lib` |

**สถานะโปรเจกต์:** สร้างใหม่ทั้งหมด (เดิม repo ว่าง) — มี demo + library พร้อม build ผ่านแล้ว

---

## ความสามารถหลัก

- แผนที่ Leaflet + OpenStreetMap tiles (ปรับ URL ได้)
- **Standalone components** — ไม่ใช้ `NgModule`
- ปักหมุด: คลิกแผนที่ / เลือกจาก search
- **Angular Material dialog** เมื่อคลิกหมุด
- **ค้นหาสถานที่**
  - ค่าเริ่มต้น: [Nominatim](https://nominatim.org/) (ไม่ต้องมี API key)
  - ทางเลือก: Google Maps JavaScript API + Places (`googlePlacesApiKey`)
- Peer dependencies รองรับ `@angular/*` และ `@angular/material` **>=19 <22**

---

## เริ่มต้น (พัฒนา / รัน demo)

```bash
npm install
npm start          # http://localhost:4200 — หน้า map demo
npm run build:lib  # build library → dist/ngx-leaflet-map
npm run build:all  # build lib + demo app
```

### Demo ทำอะไรบ้าง

- แสดงแผนที่กรุงเทพฯ พร้อมหมุดตัวอย่าง (Grand Palace)
- Search สถานที่ (Nominatim)
- คลิกแผนที่เพื่อเพิ่มหมุด
- คลิกหมุดเพื่อเปิด Material dialog
- รายการหมุดด้านล่างอัปเดตแบบ real-time

ดูโค้ดตัวอย่างที่ `src/app/pages/map-demo/map-demo.component.ts`

---

## นำ library ไปใช้ในโปรเจกต์ Angular อื่น

### 1. ติดตั้ง dependencies

```bash
npm install @darknamer/ngx-leaflet-map leaflet
npm install @angular/material @angular/cdk @angular/animations
```

ให้เวอร์ชัน Angular / Material ตรงกับโปรเจกต์ (19, 20 หรือ 21)

### 2. เพิ่มสไตล์ Leaflet ใน `angular.json`

```json
"styles": [
  "node_modules/leaflet/dist/leaflet.css",
  "src/styles.scss"
]
```

และ (แนะนำ) ใน `build.options`:

```json
"allowedCommonJsDependencies": ["leaflet"]
```

### 3. ลงทะเบียน provider (standalone / `app.config.ts`)

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
      // ใช้ Google Places:
      // googlePlacesApiKey: 'YOUR_API_KEY',
      // geocodingProvider: 'google',
    }),
  ],
};
```

### 4. ใช้ในคอมโพเนนต์

```typescript
import { Component, signal } from '@angular/core';
import {
  MapMarker,
  NgxLeafletMapComponent,
} from '@darknamer/ngx-leaflet-map';

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

### 5. ติดตั้งจาก path / npm (หลัง publish)

**Local path (พัฒนาร่วมกับ monorepo):**

```json
"dependencies": {
  "@darknamer/ngx-leaflet-map": "file:dist/ngx-leaflet-map"
}
```

**npm (หลัง publish):**

```bash
npm install @darknamer/ngx-leaflet-map
```

---

## API สรุป

### `provideNgxLeafletMap(config?)`

| Config | คำอธิบาย |
|--------|----------|
| `defaultCenter` | จุดกลางเริ่มต้น `{ lat, lng }` |
| `defaultZoom` | ระดับ zoom เริ่มต้น |
| `geocodingProvider` | `'nominatim'` \| `'google'` |
| `googlePlacesApiKey` | API key สำหรับ Google Maps JS + Places |
| `tileLayerUrl` | URL template ของ tile layer |
| `tileLayerAttribution` | ข้อความ attribution |

### `<ngx-leaflet-map>`

| Input | Default | คำอธิบาย |
|-------|---------|----------|
| `center` | จาก config | จุดกลางแผนที่ |
| `zoom` | `12` | Zoom level |
| `markers` | `[]` | รายการหมุด |
| `height` | `480px` | ความสูง container |
| `showSearch` | `true` | แสดงช่องค้นหา |
| `allowAddMarker` | `true` | คลิกแผนที่แล้วเพิ่มหมุด |
| `openDialogOnMarkerClick` | `true` | เปิด MatDialog เมื่อคลิกหมุด |

| Output | คำอธิบาย |
|--------|----------|
| `mapReady` | `L.Map` พร้อมใช้ |
| `mapClick` | คลิกแผนที่ |
| `markerClick` | คลิกหมุด |
| `markerAdded` | มีหมุดใหม่ (คลิกแผนที่ / search) |

### `<ngx-leaflet-map-search>` (ใช้แยกได้)

คอมโพเนนต์ Material autocomplete สำหรับค้นหา — emit `placeSelected` เมื่อเลือกผลลัพธ์

### `MapMarker`

```typescript
interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title?: string;
  description?: string;
  draggable?: boolean;
}
```

---

## Google Places API

1. สร้าง API key ใน [Google Cloud Console](https://console.cloud.google.com/)
2. เปิด **Maps JavaScript API** และ **Places API**
3. ตั้งค่าใน `provideNgxLeafletMap`:

```typescript
provideNgxLeafletMap({
  googlePlacesApiKey: 'YOUR_KEY',
  geocodingProvider: 'google',
});
```

หมายเหตุ: การเรียกจาก browser จะโหลดสคริปต์ `maps.googleapis.com` อัตโนมัติ — ควรจำกัด key ตาม domain

---

## พัฒนา / Publish library

```bash
# build APF package
npm run build:lib

# ทดสอบในโปรเจกต์อื่นชั่วคราว
cd dist/ngx-leaflet-map && npm pack
```

ก่อน publish จริง:

1. ปรับ `version` ใน `projects/ngx-leaflet-map/package.json`
2. `npm publish dist/ngx-leaflet-map --access public` (ถ้าใช้ scope `@darknamer`)
3. อัปเดต README และ changelog

### โครงสร้าง library

```
projects/ngx-leaflet-map/src/lib/
├── components/
│   ├── ngx-leaflet-map.component.ts      # แผนที่หลัก
│   ├── ngx-leaflet-map-search.component.ts
│   └── marker-info-dialog.component.ts
├── services/
│   ├── place-search.service.ts           # Nominatim + Google
│   └── google-maps-global.ts
├── providers/provide-ngx-leaflet-map.ts
├── models/map.models.ts
└── tokens/ngx-leaflet-map-config.token.ts
```

---

## รองรับ Angular Material 19 / 20 / 21

Library ประกาศ peer dependency:

```json
"@angular/material": ">=19.0.0 <22.0.0"
```

ให้ติดตั้ง Material เวอร์ชันเดียวกับ `@angular/core` ในแอปของคุณ (เช่น Angular 20 → Material 20)

---

## ข้อควรทราบ (Nominatim)

Nominatim มี [นโยบายการใช้งาน](https://operations.osmfoundation.org/policies/nominatim/) — เหมาะสำหรับ demo / ปริมาณต่ำ สำหรับ production ควรใช้ Google Places หรือ geocoding server ของตัวเอง

---

## License

MIT
