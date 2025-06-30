import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDisbursementElectionFormsComponent } from './project-disbursement-election-forms.component';

describe('ProjectDisbursementElectionFormsComponent', () => {
  let component: ProjectDisbursementElectionFormsComponent;
  let fixture: ComponentFixture<ProjectDisbursementElectionFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [ProjectDisbursementElectionFormsComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDisbursementElectionFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
