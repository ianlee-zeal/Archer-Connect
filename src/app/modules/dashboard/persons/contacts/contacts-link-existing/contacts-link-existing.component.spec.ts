import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactsLinkExistingComponent } from './contacts-link-existing.component';

describe('ContactsLinkExistingComponent', () => {
  let component: ContactsLinkExistingComponent;
  let fixture: ComponentFixture<ContactsLinkExistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactsLinkExistingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsLinkExistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
