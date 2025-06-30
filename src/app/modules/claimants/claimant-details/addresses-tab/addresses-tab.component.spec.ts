import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressesTabComponent } from './addresses-tab.component';

describe('AddressesTabComponent', () => {
  let component: AddressesTabComponent;
  let fixture: ComponentFixture<AddressesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressesTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
