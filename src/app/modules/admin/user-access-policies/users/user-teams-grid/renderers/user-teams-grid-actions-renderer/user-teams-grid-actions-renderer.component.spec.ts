import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTeamsGridActionsRendererComponent } from './user-teams-grid-actions-renderer.component';

describe('UserTeamsGridActionsRendererComponent', () => {
  let component: UserTeamsGridActionsRendererComponent;
  let fixture: ComponentFixture<UserTeamsGridActionsRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTeamsGridActionsRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTeamsGridActionsRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
