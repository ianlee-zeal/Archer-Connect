import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessPoliciesIndexComponent } from './user-access-policies-index.component';

describe('UserAccessPoliciesIndexComponent', () => {
  let component: UserAccessPoliciesIndexComponent;
  let fixture: ComponentFixture<UserAccessPoliciesIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccessPoliciesIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccessPoliciesIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
