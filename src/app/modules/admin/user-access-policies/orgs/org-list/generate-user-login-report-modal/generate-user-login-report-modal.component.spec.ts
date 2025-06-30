import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateUserLoginReportModalComponent } from './generate-user-login-report-modal.component';

describe('GenerateUserLoginReportModalComponent', () => {
  let component: GenerateUserLoginReportModalComponent;
  let fixture: ComponentFixture<GenerateUserLoginReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateUserLoginReportModalComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateUserLoginReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
