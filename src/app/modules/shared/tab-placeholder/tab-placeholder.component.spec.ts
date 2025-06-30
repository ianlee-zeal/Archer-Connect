import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabPlaceholderComponent } from './tab-placeholder.component';

describe('TabPlaceholderComponent', () => {
  let component: TabPlaceholderComponent;
  let fixture: ComponentFixture<TabPlaceholderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabPlaceholderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
