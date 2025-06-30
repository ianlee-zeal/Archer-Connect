import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleReportModalComponent } from './schedule-report-modal.component';

describe('ScheduleReportModalComponent', () => {
  let component: ScheduleReportModalComponent;
  let fixture: ComponentFixture<ScheduleReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleReportModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
