import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileRolesTabComponent } from './user-profile-roles-tab.component';

describe('UserProfileRolesTabComponent', () => {
  let component: UserProfileRolesTabComponent;
  let fixture: ComponentFixture<UserProfileRolesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileRolesTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileRolesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
