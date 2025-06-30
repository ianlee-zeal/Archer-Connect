import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedSearchFilterComponent } from './advanced-search-filter.component';

describe('AdvancedSearchFilterComponent', () => {
  let component: AdvancedSearchFilterComponent;
  let fixture: ComponentFixture<AdvancedSearchFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [AdvancedSearchFilterComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
