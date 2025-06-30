import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundTransferRequestModalComponent } from './refund-transfer-request-modal.component';

describe('RefundTransferRequestModalComponent', () => {
  let component: RefundTransferRequestModalComponent;
  let fixture: ComponentFixture<RefundTransferRequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundTransferRequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundTransferRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
