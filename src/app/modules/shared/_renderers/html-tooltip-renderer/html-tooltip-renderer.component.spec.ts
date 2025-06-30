import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlTooltipRendererComponent } from './html-tooltip-renderer.component';

describe('HtmlTooltipRendererComponent', () => {
  let component: HtmlTooltipRendererComponent;
  let fixture: ComponentFixture<HtmlTooltipRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtmlTooltipRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlTooltipRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
