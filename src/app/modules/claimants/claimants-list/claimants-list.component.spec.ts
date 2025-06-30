import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimantsListComponent } from './claimants-list.component';

describe('ClaimantsListComponent', () => {
  let component: ClaimantsListComponent;
  let fixture: ComponentFixture<ClaimantsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimantsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimantsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
