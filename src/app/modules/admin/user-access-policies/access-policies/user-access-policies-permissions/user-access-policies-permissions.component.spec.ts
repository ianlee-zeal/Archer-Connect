import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessPoliciesPermissionsComponent } from './user-access-policies-permissions.component';

describe('UserAccessPoliciesPermissionsComponent', () => {
  let component: UserAccessPoliciesPermissionsComponent;
  let fixture: ComponentFixture<UserAccessPoliciesPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccessPoliciesPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccessPoliciesPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
