import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatterDetailsComponent } from './matter-details.component';

describe('MatterDetailsComponent', () => {
  let component: MatterDetailsComponent;
  let fixture: ComponentFixture<MatterDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [MatterDetailsComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
