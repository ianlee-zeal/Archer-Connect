import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferResultStepComponent } from './transfer-result-step.component';

describe('TransferResultStepComponent', () => {
  let component: TransferResultStepComponent;
  let fixture: ComponentFixture<TransferResultStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferResultStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferResultStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
