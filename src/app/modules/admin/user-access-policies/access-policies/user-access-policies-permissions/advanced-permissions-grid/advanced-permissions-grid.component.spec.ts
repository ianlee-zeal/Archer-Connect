import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedPermissionsGridComponent } from './advanced-permissions-grid.component';

describe('AdvancedPermissionsGridComponent', () => {
  let component: AdvancedPermissionsGridComponent;
  let fixture: ComponentFixture<AdvancedPermissionsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedPermissionsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedPermissionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
