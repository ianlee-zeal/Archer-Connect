import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditUserTeamDialogComponent } from './create-or-edit-user-team-dialog.component';

describe('CreateOrEditUserTeamDialogComponent', () => {
  let component: CreateOrEditUserTeamDialogComponent;
  let fixture: ComponentFixture<CreateOrEditUserTeamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOrEditUserTeamDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrEditUserTeamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
