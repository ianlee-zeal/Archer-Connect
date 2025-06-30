import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDisbursementGroupList } from './project-disbursement-group-list.component';

describe('ProjectDisbursementGroupList', () => {
  let component: ProjectDisbursementGroupList;
  let fixture: ComponentFixture<ProjectDisbursementGroupList>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [ProjectDisbursementGroupList] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDisbursementGroupList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
