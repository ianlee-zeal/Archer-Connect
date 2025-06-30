import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopNavDropdownMenuComponent } from './top-nav-dropdown-menu.component';

describe('TopNavDropdownMenuComponent', () => {
  let component: TopNavDropdownMenuComponent;
  let fixture: ComponentFixture<TopNavDropdownMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopNavDropdownMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNavDropdownMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
