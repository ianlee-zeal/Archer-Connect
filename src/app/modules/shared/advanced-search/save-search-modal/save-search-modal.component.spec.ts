import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SaveSearchModalComponent } from './save-search-modal.component';

describe('SaveSearchModalComponent', () => {
  let component: SaveSearchModalComponent;
  let fixture: ComponentFixture<SaveSearchModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaveSearchModalComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
