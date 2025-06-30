import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedGridComponent } from './grouped-grid.component';

describe('GroupedGridComponent', () => {
  let component: GroupedGridComponent;
  let fixture: ComponentFixture<GroupedGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupedGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupedGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
