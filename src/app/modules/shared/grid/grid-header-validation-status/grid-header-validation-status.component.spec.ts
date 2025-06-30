import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridHeaderValidationStatusComponent } from './grid-header-validation-status.component';

describe('GridHeaderValidationStatusComponent', () => {
  let component: GridHeaderValidationStatusComponent;
  let fixture: ComponentFixture<GridHeaderValidationStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridHeaderValidationStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridHeaderValidationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
