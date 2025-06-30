import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSelectorTemplateDrivenComponent } from './date-selector-template-driven.component';

describe('DateSelectorTemplateDrivenComponent', () => {
  let component: DateSelectorTemplateDrivenComponent;
  let fixture: ComponentFixture<DateSelectorTemplateDrivenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateSelectorTemplateDrivenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateSelectorTemplateDrivenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
