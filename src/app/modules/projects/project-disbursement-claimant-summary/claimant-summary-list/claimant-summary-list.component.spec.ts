import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimantSummaryListComponent } from './claimant-summary-list.component';

describe('ClaimantSummaryList', () => {
  let component: ClaimantSummaryListComponent;
  let fixture: ComponentFixture<ClaimantSummaryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [ClaimantSummaryListComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimantSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
