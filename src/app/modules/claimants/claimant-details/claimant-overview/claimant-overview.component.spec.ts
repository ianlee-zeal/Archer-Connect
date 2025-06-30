import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimantOverviewComponent } from './claimant-overview.component';

describe('ClaimantOverviewComponent', () => {
  let component: ClaimantOverviewComponent;
  let fixture: ComponentFixture<ClaimantOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimantOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimantOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
