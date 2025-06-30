import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectListWithChipsComponent } from './multiselect-list-with-chips.component';

describe('MultiSelectListWithChipsComponent', () => {
  let component: MultiSelectListWithChipsComponent;
  let fixture: ComponentFixture<MultiSelectListWithChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [MultiSelectListWithChipsComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectListWithChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
