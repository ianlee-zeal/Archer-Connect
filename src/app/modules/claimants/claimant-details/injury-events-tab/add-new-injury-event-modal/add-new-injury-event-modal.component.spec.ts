import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddNewInjuryEventModalComponent } from './add-new-injury-event-modal.component';

describe('AddNewInjuryEventModalComponent', () => {
  let component: AddNewInjuryEventModalComponent;
  let fixture: ComponentFixture<AddNewInjuryEventModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [AddNewInjuryEventModalComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewInjuryEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
