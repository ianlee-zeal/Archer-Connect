import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfersReviewStepComponent } from './transfers-review-step.component';

describe('TransfersReviewStepComponent', () => {
  let component: TransfersReviewStepComponent;
  let fixture: ComponentFixture<TransfersReviewStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfersReviewStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransfersReviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
