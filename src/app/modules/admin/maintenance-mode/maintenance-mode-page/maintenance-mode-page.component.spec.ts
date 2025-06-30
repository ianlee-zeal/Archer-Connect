import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceModePageComponent } from './maintenance-mode-page.component';

describe('MaintenanceModePageComponent', () => {
  let component: MaintenanceModePageComponent;
  let fixture: ComponentFixture<MaintenanceModePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceModePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintenanceModePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
