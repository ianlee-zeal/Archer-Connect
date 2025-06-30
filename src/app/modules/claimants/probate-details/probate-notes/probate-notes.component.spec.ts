import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbateNotesComponent } from './probate-notes.component';

describe('ProbateNotesComponent', () => {
  let component: ProbateNotesComponent;
  let fixture: ComponentFixture<ProbateNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProbateNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProbateNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
