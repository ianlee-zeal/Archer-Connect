import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabGroupIconComponent } from './tab-group-icon.component';

describe('TabGroupIconComponent', () => {
  let component: TabGroupIconComponent;
  let fixture: ComponentFixture<TabGroupIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabGroupIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabGroupIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
