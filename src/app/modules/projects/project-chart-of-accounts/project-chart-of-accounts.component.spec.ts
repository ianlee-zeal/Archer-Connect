import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectChartOfAccountsComponent } from './project-chart-of-accounts.component';

describe('ProjectChartOfAccountsComponent', () => {
  let component: ProjectChartOfAccountsComponent;
  let fixture: ComponentFixture<ProjectChartOfAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectChartOfAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectChartOfAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
