import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTextColumnFilterComponent } from './custom-text-column-filter.component';

describe('CustomTextColumnFilterComponent', () => {
  let component: CustomTextColumnFilterComponent;
  let fixture: ComponentFixture<CustomTextColumnFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTextColumnFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTextColumnFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
