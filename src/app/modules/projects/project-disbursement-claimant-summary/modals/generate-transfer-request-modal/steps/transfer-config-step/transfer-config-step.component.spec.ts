import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferConfigStepComponent } from './transfer-config-step.component';

describe('TransferConfigStepComponent', () => {
  let component: TransferConfigStepComponent;
  let fixture: ComponentFixture<TransferConfigStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferConfigStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferConfigStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
