import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDisbursementClaimantSummary } from './project-disbursement-claimant-summary.component';

describe('ProjectDisbursementGroupsComponent', () => {
  let component: ProjectDisbursementClaimantSummary;
  let fixture: ComponentFixture<ProjectDisbursementClaimantSummary>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [ProjectDisbursementClaimantSummary] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDisbursementClaimantSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
