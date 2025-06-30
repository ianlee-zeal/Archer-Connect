import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursementDetailsModalComponent } from './disbursement-details-modal.component';

describe('DisbursementDetailsModalComponent', () => {
  let component: DisbursementDetailsModalComponent;
  let fixture: ComponentFixture<DisbursementDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisbursementDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbursementDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
