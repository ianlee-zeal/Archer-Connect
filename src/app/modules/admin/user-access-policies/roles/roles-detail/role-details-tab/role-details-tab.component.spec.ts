import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDetailsTabComponent } from './role-details-tab.component';

describe('RoleDetailsTabComponent', () => {
  let component: RoleDetailsTabComponent;
  let fixture: ComponentFixture<RoleDetailsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleDetailsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleDetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
