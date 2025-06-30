import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationTabComponent } from './communication-tab.component';

describe('CommunicationTabComponent', () => {
  let component: CommunicationTabComponent;
  let fixture: ComponentFixture<CommunicationTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunicationTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
