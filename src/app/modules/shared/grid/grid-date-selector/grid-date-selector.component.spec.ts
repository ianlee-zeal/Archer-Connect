import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridDateSelectorComponent } from './grid-date-selector.component';

describe('GridDateSelectorComponent', () => {
  let component: GridDateSelectorComponent;
  let fixture: ComponentFixture<GridDateSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridDateSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridDateSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
