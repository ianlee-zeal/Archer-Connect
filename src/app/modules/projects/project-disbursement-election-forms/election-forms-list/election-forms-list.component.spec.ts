import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElectionFormsListComponent } from './election-forms-list.component';

describe('ElectionFormsListComponent', () => {
  let component: ElectionFormsListComponent;
  let fixture: ComponentFixture<ElectionFormsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ElectionFormsListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectionFormsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
