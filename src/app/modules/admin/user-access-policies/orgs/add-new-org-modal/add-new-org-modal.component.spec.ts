import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewOrgModalComponent } from './add-new-org-modal.component';

describe('AddNewOrgModalComponent', () => {
  let component: AddNewOrgModalComponent;
  let fixture: ComponentFixture<AddNewOrgModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewOrgModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewOrgModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
