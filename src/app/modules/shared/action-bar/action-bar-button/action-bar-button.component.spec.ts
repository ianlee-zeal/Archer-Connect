import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionBarButtonComponent } from './action-bar-button.component';


describe('ActionBarComponent', () => {
  let component: ActionBarButtonComponent;
  let fixture: ComponentFixture<ActionBarButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionBarButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionBarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
