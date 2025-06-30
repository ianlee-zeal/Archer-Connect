import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddressModalComponent } from './add-address-modal.component';

describe('AddAddressModalComponent', () => {
  let component: AddAddressModalComponent;
  let fixture: ComponentFixture<AddAddressModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddAddressModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
