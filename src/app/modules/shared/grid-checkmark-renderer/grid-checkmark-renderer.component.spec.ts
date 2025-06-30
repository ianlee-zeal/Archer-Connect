import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridCheckmarkRendererComponent } from './grid-checkmark-renderer.component';

describe('GridCheckmarkRendererComponent', () => {
  let component: GridCheckmarkRendererComponent;
  let fixture: ComponentFixture<GridCheckmarkRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridCheckmarkRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridCheckmarkRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
