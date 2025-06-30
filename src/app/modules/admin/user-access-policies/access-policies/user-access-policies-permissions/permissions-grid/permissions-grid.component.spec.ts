import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsGridComponent } from './permissions-grid.component';

describe('PermissionsGridComponent', () => {
  let component: PermissionsGridComponent;
  let fixture: ComponentFixture<PermissionsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
