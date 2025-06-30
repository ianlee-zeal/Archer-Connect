import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundTransferRequestFormStepComponent } from './request-form-step.component';

describe('TransferConfigStepComponent', () => {
  let component: RefundTransferRequestFormStepComponent;
  let fixture: ComponentFixture<RefundTransferRequestFormStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundTransferRequestFormStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundTransferRequestFormStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
