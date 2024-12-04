import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  themeOptions = ['history', 'art', 'nature', 'architecture']; // Themes
  selectedTheme: string | null = null; // User-selected theme
  locations: { name: string }[] = []; // AI-generated locations
  additionalLocation: string | null = null; // User-selected location
  dietaryRestriction: string = ''; // User-selected dietary restriction
  restaurants: { name: string; lat: number | null; lng: number | null }[] = []; 

  constructor(private http: HttpClient, private router: Router) {}

  // Fetch AI-generated locations based on theme
  onThemeSelect(theme: string): void {
    this.selectedTheme = theme;

    this.http.post<{ locations: { name: string }[] }>('http://localhost:5000/ai-process', { theme }).subscribe(
      (response) => {
        console.log('Fetched locations:', response.locations);
        this.locations = response.locations;
      },
      (error) => {
        console.error('Error fetching locations:', error);
      }
    );
  }

  fetchRestaurants(): void {
    if (!this.dietaryRestriction) {
      alert('Please select a dietary restriction!');
      return;
    }

    const payload = {
      dietaryRestriction: this.dietaryRestriction,
      userLocation: 'Manhattan', // Static user location for now
    };

    this.http
      .post<{ restaurants: { name: string; lat: number | null; lng: number | null }[] }>(
        'http://localhost:5000/api/ai-process-restaurants',
        payload
      )
      .subscribe(
        (response) => {
          console.log('Fetched restaurants:', response.restaurants);
          this.restaurants = response.restaurants;
        },
        (error) => {
          console.error('Error fetching restaurants:', error);
          alert('Error fetching restaurant data. Please try again later.');
        }
      );
  }

  // Add user-specific location
  onPlaceAdd(): void {
    if (this.additionalLocation) {
      this.locations.push({ name: this.additionalLocation }); // Add user location
      this.additionalLocation = null; // Clear input
    }
  }

  // Start the tour and navigate to the cultural map component
  startTour(): void {
    this.router.navigate(['/cultural-tour'], {
      queryParams: { theme: this.selectedTheme, locations: JSON.stringify(this.locations) }
    });
  }


  // Navigate to restaurant map with the selected dietary restriction
  goToRestaurantMap() {
    if (this.dietaryRestriction) {
      this.router.navigate(['/restaurant-map'], { queryParams: { dietaryRestriction: this.dietaryRestriction, locations: JSON.stringify(this.locations) } });
      console.log("Tunde this is ", this.locations)
    } else {
      alert("Please select a dietary preference.");
    }
  }

  

}
