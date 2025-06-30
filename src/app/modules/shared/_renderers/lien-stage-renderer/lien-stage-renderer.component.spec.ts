import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LienStageRendererComponent } from './lien-stage-renderer.component';

describe('LienStageRendererComponent', () => {
  let component: LienStageRendererComponent;
  let fixture: ComponentFixture<LienStageRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [LienStageRendererComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LienStageRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
