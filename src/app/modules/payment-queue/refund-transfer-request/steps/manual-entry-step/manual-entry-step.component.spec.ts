import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryStepComponent } from './manual-entry-step.component';

describe('ManualEntryStepComponent', () => {
  let component: ManualEntryStepComponent;
  let fixture: ComponentFixture<ManualEntryStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualEntryStepComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManualEntryStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
