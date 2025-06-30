import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentInstructionsGridActionsRendererComponent } from './payment-instructions-grid-actions-renderer.component';

describe('PaymentInstructionsGridActionsRendererComponent', () => {
  let component: PaymentInstructionsGridActionsRendererComponent;
  let fixture: ComponentFixture<PaymentInstructionsGridActionsRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [PaymentInstructionsGridActionsRendererComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentInstructionsGridActionsRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
