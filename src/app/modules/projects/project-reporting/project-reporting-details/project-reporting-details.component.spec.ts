import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReportingDetailsComponent } from './project-reporting-details.component';

describe('ProjectReportingDetailsComponent', () => {
  let component: ProjectReportingDetailsComponent;
  let fixture: ComponentFixture<ProjectReportingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReportingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectReportingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
