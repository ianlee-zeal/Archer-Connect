import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateTransferRequestModalComponent } from './generate-transfer-request-modal.component';

describe('GeneratePaymentRequestModalComponent', () => {
  let component: GenerateTransferRequestModalComponent;
  let fixture: ComponentFixture<GenerateTransferRequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateTransferRequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateTransferRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
