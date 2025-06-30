import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsTabComponent } from './project-details-tab.component';

describe('ProjectDetailsTabComponent', () => {
  let component: ProjectDetailsTabComponent;
  let fixture: ComponentFixture<ProjectDetailsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDetailsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
