import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchValidationMessagesComponent } from './search-validation-messages.component';

describe('SearchValidationMessagesComponent', () => {
  let component: SearchValidationMessagesComponent;
  let fixture: ComponentFixture<SearchValidationMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchValidationMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchValidationMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
