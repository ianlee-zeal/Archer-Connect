import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileSubscriptionsTabComponent } from './user-profile-subscriptions-tab.component';

describe('UserProfileSubscriptionsTabComponent', () => {
  let component: UserProfileSubscriptionsTabComponent;
  let fixture: ComponentFixture<UserProfileSubscriptionsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileSubscriptionsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileSubscriptionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
