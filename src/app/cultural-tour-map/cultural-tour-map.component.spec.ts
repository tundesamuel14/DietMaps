import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CulturalTourMapComponent } from './cultural-tour-map.component';

describe('CulturalTourMapComponent', () => {
  let component: CulturalTourMapComponent;
  let fixture: ComponentFixture<CulturalTourMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CulturalTourMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CulturalTourMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
