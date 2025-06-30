import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextboxEditorRendererComponent } from './textbox-editor-renderer.component';

describe('TextboxEditorRendererComponent', () => {
  let component: TextboxEditorRendererComponent;
  let fixture: ComponentFixture<TextboxEditorRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextboxEditorRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxEditorRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
