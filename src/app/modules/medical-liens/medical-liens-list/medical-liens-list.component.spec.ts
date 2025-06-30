import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicalLiensListComponent } from './medical-liens-list.component';



describe('MedicalLiensListComponent', () => {
  let component: MedicalLiensListComponent;
  let fixture: ComponentFixture<MedicalLiensListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MedicalLiensListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalLiensListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
