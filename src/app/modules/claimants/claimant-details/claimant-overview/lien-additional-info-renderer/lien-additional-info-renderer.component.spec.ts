import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LienAdditionalInfoRendererComponent } from './lien-additional-info-renderer.component';

describe('LienOutcomeRendererComponent', () => {
  let component: LienAdditionalInfoRendererComponent;
  let fixture: ComponentFixture<LienAdditionalInfoRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [LienAdditionalInfoRendererComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LienAdditionalInfoRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
