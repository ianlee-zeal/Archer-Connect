import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPaymentsDetailsStepComponent } from './review-payments-details-step.component';

describe('ReviewPaymentsDetailsStepComponent', () => {
  let component: ReviewPaymentsDetailsStepComponent;
  let fixture: ComponentFixture<ReviewPaymentsDetailsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewPaymentsDetailsStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewPaymentsDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
