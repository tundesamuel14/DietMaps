import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http'; // Import HttpClientModule
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';




import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CulturalTourMapComponent } from './cultural-tour-map/cultural-tour-map.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RestaurantMapComponent } from './restaurant-map/restaurant-map.component';

@NgModule({
  declarations: [
    AppComponent,
    CulturalTourMapComponent,
    LandingPageComponent,
    RestaurantMapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule, // Add FormsModule here
    AppRoutingModule,
    MatSelectModule,
    BrowserAnimationsModule, // Add this line
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    HttpClientModule, // Import HttpClientModule to use HttpClient in your app

  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line

})
export class AppModule { }
