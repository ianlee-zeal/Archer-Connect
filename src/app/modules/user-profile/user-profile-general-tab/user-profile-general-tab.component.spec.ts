import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileGeneralTabComponent } from './user-profile-general-tab.component';


describe('UserProfileGeneralTabComponent', () => {
  let component: UserProfileGeneralTabComponent;
  let fixture: ComponentFixture<UserProfileGeneralTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileGeneralTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
