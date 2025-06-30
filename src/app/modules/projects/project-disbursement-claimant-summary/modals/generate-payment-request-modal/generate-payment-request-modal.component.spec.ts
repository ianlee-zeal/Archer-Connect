import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePaymentRequestModalComponent } from './generate-payment-request-modal.component';

describe('GeneratePaymentRequestModalComponent', () => {
  let component: GeneratePaymentRequestModalComponent;
  let fixture: ComponentFixture<GeneratePaymentRequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneratePaymentRequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratePaymentRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
