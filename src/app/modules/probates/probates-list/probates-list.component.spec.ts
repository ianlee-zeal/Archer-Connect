import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProbatesListComponent } from './probates-list.component';

describe('ProbatesListComponent', () => {
  let component: ProbatesListComponent;
  let fixture: ComponentFixture<ProbatesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [ProbatesListComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProbatesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
