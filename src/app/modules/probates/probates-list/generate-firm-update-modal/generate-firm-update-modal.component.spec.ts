import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateFirmUpdateModalComponent } from './generate-firm-update-modal.component';

describe('GenerateFirmUpdateModalComponent', () => {
  let component: GenerateFirmUpdateModalComponent;
  let fixture: ComponentFixture<GenerateFirmUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateFirmUpdateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateFirmUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
