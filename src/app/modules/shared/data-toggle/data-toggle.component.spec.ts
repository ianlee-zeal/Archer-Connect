import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataToggleComponent } from './data-toggle.component';

describe('DataToggleComponent', () => {
  let component: DataToggleComponent;
  let fixture: ComponentFixture<DataToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
