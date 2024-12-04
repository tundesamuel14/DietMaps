import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { CulturalTourMapComponent } from './cultural-tour-map/cultural-tour-map.component';
import { RestaurantMapComponent } from './restaurant-map/restaurant-map.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'cultural-tour', component: CulturalTourMapComponent },
  { path: 'restaurant-map', component: RestaurantMapComponent }, // Route for restaurant map

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
