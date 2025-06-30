import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTeamsGridComponent } from './user-teams-grid.component';

describe('UserTeamsGridComponent', () => {
  let component: UserTeamsGridComponent;
  let fixture: ComponentFixture<UserTeamsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTeamsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTeamsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
