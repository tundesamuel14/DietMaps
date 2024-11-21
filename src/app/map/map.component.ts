import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map3dContainer', { static: false }) map3dElement!: ElementRef;
  isMascotPopupVisible: boolean = false;
  selectedPreference: string = '';
  map3D: any;
  polygons: any[] = [];

  ngAfterViewInit(): void {
    this.load3DMap();
  }

  async load3DMap(): Promise<void> {
    try {
      const maps3dLibrary = (google.maps as any).importLibrary("maps3d");
      const { Map3DElement, Polygon3DElement, AltitudeMode } = await maps3dLibrary;

      this.map3D = new Map3DElement({
        center: { lat: 40.758, lng: -73.9855, altitude: 400 },
        range: 1000,
        tilt: 60,
        heading: 180,
      });

      this.map3D.defaultLabelsDisabled = true;
      document.getElementById('map3d-container')?.appendChild(this.map3D);
      console.log("3D Map initialized successfully.");
    } catch (error) {
      console.error("Error loading 3D map:", error);
    }
  }

  setPreference(preference: string): void {
    this.selectedPreference = preference;
    console.log(`User selected preference: ${preference}`);
    this.isMascotPopupVisible = false;
    this.addPolygonBasedOnPreference(preference);
  }

  addPolygonBasedOnPreference(preference: string): void {
    // Remove existing polygons from the map if any
    this.polygons.forEach(polygon => polygon.remove());
    this.polygons = [];

    const polygonOptions = {
      strokeColor: "#FF0000",
      strokeWidth: 4,
      altitudeMode: (google as any).maps.maps3d.AltitudeMode.ABSOLUTE,
      extruded: true,
      drawsOccludedSegments: true,
    };

    let polygonCoordinates: { lat: number; lng: number; altitude: number }[];

    switch (preference) {
      case 'relaxation':
        polygonCoordinates = [
          { lat: 40.759, lng: -73.985, altitude: 400 },
          { lat: 40.758, lng: -73.986, altitude: 400 },
          { lat: 40.757, lng: -73.984, altitude: 400 },
          { lat: 40.759, lng: -73.985, altitude: 400 }
        ];
        break;
      case 'adventure':
        polygonCoordinates = [
          { lat: 40.756, lng: -73.986, altitude: 400 },
          { lat: 40.755, lng: -73.987, altitude: 400 },
          { lat: 40.754, lng: -73.985, altitude: 400 },
          { lat: 40.756, lng: -73.986, altitude: 400 }
        ];
        break;
      case 'luxury':
        polygonCoordinates = [
          { lat: 40.757, lng: -73.984, altitude: 400 },
          { lat: 40.756, lng: -73.983, altitude: 400 },
          { lat: 40.755, lng: -73.984, altitude: 400 },
          { lat: 40.757, lng: -73.984, altitude: 400 }
        ];
        break;
      default:
        return;
    }

    const polygon = new (google as any).maps.maps3d.Polygon3DElement({
      ...polygonOptions,
      outerCoordinates: polygonCoordinates
    });

    this.map3D.append(polygon);
    this.polygons.push(polygon);

    console.log(`Added polygon for ${preference} preference.`);
  }

  toggleMascotPopup(): void {
    this.isMascotPopupVisible = !this.isMascotPopupVisible;
  }
}
