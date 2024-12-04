import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cultural-tour-map',
  templateUrl: './cultural-tour-map.component.html',
  styleUrls: ['./cultural-tour-map.component.css'],
})
export class CulturalTourMapComponent implements AfterViewInit {
  @ViewChild('tourMap', { static: false }) map3DElement!: ElementRef;
  map3D: any;
  selectedTheme: string = 'history'; // Default theme
  locations: { name: string; lat: number; lng: number }[] = []; // Dynamically fetched locations
  markers: any[] = []; // Array to store markers

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  // Create extruded markers
  async addExtrudedMarker(position: { lat: number; lng: number; altitude: number }) {
    const { Marker3DElement } = await (google.maps as any).importLibrary('maps3d');
    const marker = new (Marker3DElement as any)({
      position,
      altitudeMode: 'RELATIVE_TO_GROUND',
      extruded: true,
    });

    if (marker) {
      this.map3D.append(marker);
      this.markers.push(marker); // Store the marker
    } else {
      console.error('Marker3DElement is not available.');
    }
  }

  // Remove all existing markers
  clearMarkers() {
    for (const marker of this.markers) {
      this.map3D.removeChild(marker);
    }
    this.markers = [];
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const locationsData = JSON.parse(params['locations'] || '[]');
      this.locations = locationsData.map((location: any) => {
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lng);

        console.log(`Location: ${location.name}, Latitude: ${lat}, Longitude: ${lng}`);
        if (isNaN(lat) || isNaN(lng)) {
          console.error(`Invalid coordinates for location: ${location.name}`);
        }

        return { name: location.name, lat, lng };
      });
      console.log('Final validated locations:', this.locations);
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.startCityFlyThrough();
  }

  initializeMap(): void {
    this.map3D = this.map3DElement.nativeElement;
    console.log('3D Map accessed successfully:', this.map3D);
  }

  startCityFlyThrough() {
    if (!this.locations || this.locations.length === 0) {
      console.error('No locations available for the tour.');
      return;
    }

    let index = 0;

    const nextStop = () => {
      if (index < this.locations.length) {
        const currentLocation = this.locations[index];

        if (typeof currentLocation.lat !== 'number' || typeof currentLocation.lng !== 'number') {
          console.error('Invalid location data:', currentLocation);
          return;
        }

        console.log('Flying to:', currentLocation);

        this.map3D.flyCameraTo({
          endCamera: {
            center: { lat: currentLocation.lat, lng: currentLocation.lng, altitude: 0 },
            tilt: 67.5,
            range: 1300,
          },
          durationMillis: 20000,
        });

        this.map3D.addEventListener(
          'gmp-animationend',
          async () => {
            console.log('Arrived at:', currentLocation);

            this.clearMarkers();
            await this.addExtrudedMarker({
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              altitude: 100,
            });

            this.map3D.flyCameraAround({
              camera: {
                center: { lat: currentLocation.lat, lng: currentLocation.lng, altitude: 0 },
                tilt: 67.5,
                range: 1300,
              },
              durationMillis: 45000,
              rounds: 1,
            });

            this.map3D.addEventListener(
              'gmp-animationend',
              () => {
                console.log('Completed 360 view at:', currentLocation);
                index++;
                setTimeout(nextStop, 3000); // Pause before the next stop
              },
              { once: true }
            );
          },
          { once: true }
        );
      }
    };

    nextStop();
  }

  stopTour() {
    if (this.map3D) {
      this.map3D.stopCameraAnimation();
      console.log('Tour stopped.');
      this.clearMarkers();
    }
  }
}
