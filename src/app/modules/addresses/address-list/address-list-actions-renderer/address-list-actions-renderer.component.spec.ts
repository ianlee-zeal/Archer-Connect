import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressListActionsRendererComponent } from './address-list-actions-renderer.component';

describe('AddressListActionsRendererComponent', () => {
  let component: AddressListActionsRendererComponent;
  let fixture: ComponentFixture<AddressListActionsRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressListActionsRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressListActionsRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
