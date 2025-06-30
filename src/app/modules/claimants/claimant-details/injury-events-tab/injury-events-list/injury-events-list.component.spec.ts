import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InjuryEventsListComponent } from './injury-events-list.component';

describe('InjuryEventsListComponent', () => {
  let component: InjuryEventsListComponent;
  let fixture: ComponentFixture<InjuryEventsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InjuryEventsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InjuryEventsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
