import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RenameSearchModalComponent } from './rename-search-modal.component';

describe('RenameSearchModalComponent', () => {
  let component: RenameSearchModalComponent;
  let fixture: ComponentFixture<RenameSearchModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RenameSearchModalComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
