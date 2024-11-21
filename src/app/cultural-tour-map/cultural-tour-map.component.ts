import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cultural-tour-map',
  templateUrl: './cultural-tour-map.component.html',
  styleUrls: ['./cultural-tour-map.component.css']
})
export class CulturalTourMapComponent implements AfterViewInit {
  @ViewChild('tourMap', { static: false }) map3DElement!: ElementRef;
  map3D: any;
  selectedTheme: "history" | "art" = "history"; // Default theme

  constructor(private route: ActivatedRoute) {}

  // Themes with locations and configurations
  readonly themes = {
    history: [
      { center: { lat: 40.6892, lng: -74.0445, altitude: 0 }, tilt: 67.5, range: 550 }, // Statue of Liberty, NY
      { center: { lat: 51.5007, lng: -0.1246, altitude: 0 }, tilt: 67.5, range: 550 }, // Big Ben, London
      { center: { lat: 29.9792, lng: 31.1342, altitude: 0 }, tilt: 67.5, range: 550 }, // Pyramids of Giza, Egypt
      { center: { lat: 35.6586, lng: 139.7454, altitude: 0 }, tilt: 67.5, range: 550 }, // Tokyo Tower, Japan
      { center: { lat: 41.9028, lng: 12.4964, altitude: 0 }, tilt: 67.5, range: 550 }, // Colosseum, Rome
      { center: { lat: 48.8584, lng: 2.2945, altitude: 0 }, tilt: 67.5, range: 550 }, // Eiffel Tower, Paris
    ],
    art: [
      { center: { lat: 40.7794, lng: -73.9632, altitude: 0 }, tilt: 67.5, range: 550 }, // Metropolitan Museum, NY
      { center: { lat: 48.8606, lng: 2.3376, altitude: 0 }, tilt: 67.5, range: 550 }, // Louvre, Paris
      { center: { lat: 35.6895, lng: 139.6917, altitude: 0 }, tilt: 67.5, range: 550 }, // Tokyo National Museum
      { center: { lat: 41.9029, lng: 12.4545, altitude: 0 }, tilt: 67.5, range: 550 }, // Vatican Museums, Rome
      { center: { lat: 51.5194, lng: -0.1270, altitude: 0 }, tilt: 67.5, range: 550 }, // British Museum, London
      { center: { lat: 52.5163, lng: 13.3777, altitude: 0 }, tilt: 67.5, range: 550 }, // Berlin State Museum
    ],
  };

  // Array to store markers to remove them when navigating to the next location
  markers: any[] = [];

  async addExtrudedMarker(position: { lat: number; lng: number; altitude: number }) {
    const { Marker3DElement } = await (google.maps as any).importLibrary("maps3d");

    // Create a new extruded marker
    const marker = new (Marker3DElement as any)({
      position,
      altitudeMode: 'RELATIVE_TO_GROUND',
      extruded: true,
    });

    if (marker) {
      this.map3D.append(marker);
      this.markers.push(marker); // Store the marker to remove it later
    } else {
      console.error("Marker3DElement is not available.");
    }
  }

  // Remove all existing markers before adding a new one
  clearMarkers() {
    for (const marker of this.markers) {
      this.map3D.removeChild(marker);
    }
    this.markers = [];
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedTheme = params['theme'] || "history";
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.startCityFlyThrough(this.selectedTheme);
  }

  initializeMap(): void {
    this.map3D = this.map3DElement.nativeElement;
    console.log("3D Map accessed successfully:", this.map3D);
  }

  startCityFlyThrough(theme: "history" | "art") {
    const tourPath = this.themes[theme];
    let index = 0;

    const nextStop = () => {
      if (index < tourPath.length) {
        const currentLocation = tourPath[index];
        console.log("Starting journey to:", currentLocation);

        // Fly to the next location with a smooth transition
        this.map3D.flyCameraTo({
          endCamera: currentLocation,
          durationMillis: 20000, // Time to reach the location smoothly
        });

        // Wait for `flyCameraTo` to finish before starting `flyCameraAround`
        this.map3D.addEventListener('gmp-animationend', async () => {
          console.log("Arrived at:", currentLocation);

          // Clear previous markers and add a new extruded marker at the current location
          this.clearMarkers();
          await this.addExtrudedMarker({ lat: currentLocation.center.lat, lng: currentLocation.center.lng, altitude: 100 });

          // Start a 360 rotation once we arrive
          this.map3D.flyCameraAround({
            camera: currentLocation,
            durationMillis: 45000, // Slow, full rotation for 360 view
            rounds: 1,
          });

          // Wait for `flyCameraAround` to complete before moving to the next location
          this.map3D.addEventListener('gmp-animationend', () => {
            console.log("Completed 360 view at:", currentLocation);
            index++; // Move to the next location
            setTimeout(nextStop, 3000); // Pause before continuing to the next location
          }, { once: true });
        }, { once: true });
      }
    };

    nextStop();
  }

  stopTour() {
    if (this.map3D) {
      this.map3D.stopCameraAnimation();
      console.log("Tour stopped.");
      this.clearMarkers();
    }
  }
}
