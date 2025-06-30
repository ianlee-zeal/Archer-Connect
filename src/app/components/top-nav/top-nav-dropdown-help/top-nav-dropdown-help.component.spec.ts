import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopNavDropdownHelpComponent } from './top-nav-dropdown-help.component';

describe('TopNavDropdownHelpComponent', () => {
  let component: TopNavDropdownHelpComponent;
  let fixture: ComponentFixture<TopNavDropdownHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopNavDropdownHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNavDropdownHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
