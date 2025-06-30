import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessPoliciesDetailComponent } from './user-access-policies-detail.component';

describe('UserAccessPoliciesDetailComponent', () => {
  let component: UserAccessPoliciesDetailComponent;
  let fixture: ComponentFixture<UserAccessPoliciesDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAccessPoliciesDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccessPoliciesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
