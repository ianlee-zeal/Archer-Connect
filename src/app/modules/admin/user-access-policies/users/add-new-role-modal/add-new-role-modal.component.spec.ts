import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewRoleModalComponent } from './add-new-role-modal.component';

describe('AddNewRoleModalComponent', () => {
  let component: AddNewRoleModalComponent;
  let fixture: ComponentFixture<AddNewRoleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewRoleModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewRoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
