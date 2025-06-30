import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailsTabComponent } from './product-details-tab.component';


describe('MedicalLiensComponent', () => {
  let component: ProductDetailsTabComponent;
  let fixture: ComponentFixture<ProductDetailsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProductDetailsTabComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
