import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFieldPermissionsComponent } from './modal-field-permissions.component';

describe('ModalFieldPermissionsComponent', () => {
  let component: ModalFieldPermissionsComponent;
  let fixture: ComponentFixture<ModalFieldPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalFieldPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFieldPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
