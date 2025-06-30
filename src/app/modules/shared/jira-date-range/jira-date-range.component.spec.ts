import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraDateRangeComponent } from './jira-date-range.component';

describe('NewDateRangeComponent', () => {
  let component: JiraDateRangeComponent;
  let fixture: ComponentFixture<JiraDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JiraDateRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JiraDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
