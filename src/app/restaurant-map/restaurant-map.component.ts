import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-restaurant-map',
  templateUrl: './restaurant-map.component.html',
  styleUrls: ['./restaurant-map.component.css'],
})
export class RestaurantMapComponent implements AfterViewInit {
  @ViewChild('restaurantMap', { static: false }) map3DElement!: ElementRef;
  map3D: any;
  dietaryRestriction: string = ''; // Selected dietary restriction
  restaurants: {
    name: string;
    lat: number;
    lng: number;
    address: string;
    website: string;
    openingHours: string[];
    photos: string[];
  }[] = []; // Fetched restaurants with details
  markers: any[] = []; // Array to store markers
  selectedRestaurant: any = null; // Current restaurant being displayed
  currentIndex: number = 0; // Track the current restaurant index
  showNextPopup: boolean = false; // Controls visibility of the "Next Location" button
  showRestaurantPopup: boolean = false; // Controls visibility of the restaurant details pop-up

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.dietaryRestriction = params['dietaryRestriction'] || '';
      this.fetchRestaurants();
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map3D = this.map3DElement.nativeElement;
    console.log('3D Map initialized:', this.map3D);
  }

  fetchRestaurants(): void {
    this.http
      .post<{
        restaurants: {
          name: string;
          lat: number;
          lng: number;
          address: string;
          website: string;
          openingHours: string[];
          photos: string[];
        }[];
      }>('http://localhost:5000/api/ai-process-restaurants', {
        dietaryRestriction: this.dietaryRestriction,
      })
      .subscribe(
        (response) => {
          this.restaurants = response.restaurants;
          console.log('Fetched restaurants:', this.restaurants);
          this.startTour();
        },
        (error) => {
          console.error('Error fetching restaurants:', error);
        }
      );
  }

  async addExtrudedMarker(position: { lat: number; lng: number; altitude: number }) {
    const { Marker3DElement } = await (google.maps as any).importLibrary('maps3d');
    const marker = new (Marker3DElement as any)({
      position,
      altitudeMode: 'RELATIVE_TO_GROUND',
      extruded: true,
    });

    if (marker) {
      this.map3D.append(marker);
      this.markers.push(marker);
    }
  }

  clearMarkers() {
    for (const marker of this.markers) {
      this.map3D.removeChild(marker);
    }
    this.markers = [];
  }

  startTour(): void {
    if (!this.restaurants || this.restaurants.length === 0) {
      console.error('No restaurants available for the tour.');
      return;
    }

    this.currentIndex = 0;
    this.flyToLocation(this.currentIndex);
  }

  flyToLocation(index: number): void {
    if (index >= this.restaurants.length) {
      console.log('Tour finished.');
      return;
    }

    const currentRestaurant = this.restaurants[index];
    this.selectedRestaurant = currentRestaurant; // Update the selected restaurant details
    this.showNextPopup = false; // Hide the "Next Location" button initially
    this.showRestaurantPopup = false; // Hide the restaurant details pop-up initially

    this.map3D.flyCameraTo({
      endCamera: {
        center: { lat: currentRestaurant.lat, lng: currentRestaurant.lng, altitude: 0 },
        tilt: 67.5,
        range: 170,
      },
      durationMillis: 20000,
    });

    this.map3D.addEventListener(
      'gmp-animationend',
      async () => {
        await this.addExtrudedMarker({
          lat: currentRestaurant.lat,
          lng: currentRestaurant.lng,
          altitude: 55,
        });

        this.map3D.flyCameraAround({
          camera: {
            center: { lat: currentRestaurant.lat, lng: currentRestaurant.lng, altitude: 0 },
            tilt: 67.5,
            range: 210,
          },
          durationMillis: 45000,
          rounds: 1,
        });

        this.map3D.addEventListener(
          'gmp-animationend',
          () => {
            console.log('Completed flyCameraAround at:', currentRestaurant);
            this.showNextPopup = true; // Show "Next Location" button
            this.showRestaurantPopup = true; // Show restaurant details pop-up
          },
          { once: true }
        );
      },
      { once: true }
    );
  }


  flyToNext(): void {
    this.currentIndex++;
    this.clearMarkers();
    this.flyToLocation(this.currentIndex);
  }

  getPhotoUrl(photoReferences: string[]): string {
  if (!photoReferences || photoReferences.length === 0) {
    return 'assets/default-restaurant.jpg'; // Placeholder image if no photos are available
  }
  const firstPhotoReference = photoReferences[0];
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${firstPhotoReference}&key=YOUR_GOOGLE_API_KEY`;
}


  stopTour(): void {
    this.map3D.stopCameraAnimation();
    this.clearMarkers();
    this.selectedRestaurant = null; // Clear the selected restaurant
    this.showNextPopup = false; // Hide the "Next Location" button
    this.showRestaurantPopup = false; // Hide the restaurant details pop-up
  }
}
