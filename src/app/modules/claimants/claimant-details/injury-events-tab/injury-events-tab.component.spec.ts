import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InjuryEventsTabComponent } from './injury-events-tab.component';

describe('InjuryEventsTabComponent', () => {
  let component: InjuryEventsTabComponent;
  let fixture: ComponentFixture<InjuryEventsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InjuryEventsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InjuryEventsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
