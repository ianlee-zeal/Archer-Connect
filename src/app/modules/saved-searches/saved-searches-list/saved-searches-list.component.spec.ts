import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SavedSearchesListComponent } from './saved-searches-list.component';


describe('SavedSearchesListComponent', () => {
  let component: SavedSearchesListComponent;
  let fixture: ComponentFixture<SavedSearchesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavedSearchesListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedSearchesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
