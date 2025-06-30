import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldPermissionsGridComponent } from './field-permissions-grid.component';

describe('FieldPermissionsGridComponent', () => {
  let component: FieldPermissionsGridComponent;
  let fixture: ComponentFixture<FieldPermissionsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldPermissionsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldPermissionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
