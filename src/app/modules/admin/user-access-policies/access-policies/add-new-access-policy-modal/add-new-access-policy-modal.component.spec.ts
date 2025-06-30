import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewAccessPolicyModalComponent } from './add-new-access-policy-modal.component';

describe('AddNewAccessPolicyModalComponent', () => {
  let component: AddNewAccessPolicyModalComponent;
  let fixture: ComponentFixture<AddNewAccessPolicyModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewAccessPolicyModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewAccessPolicyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
