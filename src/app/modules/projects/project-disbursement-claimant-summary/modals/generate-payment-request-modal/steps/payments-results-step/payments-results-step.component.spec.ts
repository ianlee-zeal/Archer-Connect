import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsResultsStepComponent } from './payments-results-step.component';

describe('PaymentsResultsStepComponent', () => {
  let component: PaymentsResultsStepComponent;
  let fixture: ComponentFixture<PaymentsResultsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [PaymentsResultsStepComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsResultsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
