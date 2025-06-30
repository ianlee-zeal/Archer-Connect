import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DisbursementsPaymentListActionsRendererComponent } from './disbursements-payment-list-actions-renderer.component';

describe('DisbursementsPaymentListActionsRendererComponent', () => {
  let component: DisbursementsPaymentListActionsRendererComponent;
  let fixture: ComponentFixture<DisbursementsPaymentListActionsRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [DisbursementsPaymentListActionsRendererComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbursementsPaymentListActionsRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
