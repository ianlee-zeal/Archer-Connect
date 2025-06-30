import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDisbursementGroupsComponent } from './project-disbursement-groups.component';

describe('ProjectDisbursementGroupsComponent', () => {
  let component: ProjectDisbursementGroupsComponent;
  let fixture: ComponentFixture<ProjectDisbursementGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDisbursementGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDisbursementGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
