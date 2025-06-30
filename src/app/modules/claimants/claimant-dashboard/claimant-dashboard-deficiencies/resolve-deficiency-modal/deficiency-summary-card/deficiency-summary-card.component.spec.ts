import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeficiencySummaryCardComponent } from './deficiency-summary-card.component';

describe('DeficiencySummaryCardComponent', () => {
  let component: DeficiencySummaryCardComponent;
  let fixture: ComponentFixture<DeficiencySummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeficiencySummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeficiencySummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
