import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlementInfoTabComponent } from './settlement-info-tab.component';

describe('SettlementInfoTabComponent', () => {
  let component: SettlementInfoTabComponent;
  let fixture: ComponentFixture<SettlementInfoTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettlementInfoTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettlementInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
