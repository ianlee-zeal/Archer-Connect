import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonGeneralTabComponent } from './person-general-tab.component';

describe('PersonGeneralTabComponent', () => {
  let component: PersonGeneralTabComponent;
  let fixture: ComponentFixture<PersonGeneralTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonGeneralTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
