import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardColComponent } from './card-col.component';

describe('CardColComponent', () => {
  let component: CardColComponent;
  let fixture: ComponentFixture<CardColComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardColComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
