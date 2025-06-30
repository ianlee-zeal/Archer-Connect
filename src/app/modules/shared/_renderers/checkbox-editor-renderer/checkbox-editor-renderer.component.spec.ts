import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxEditorRendererComponent } from './checkbox-editor-renderer.component';

describe('CheckboxEditorRendererComponent', () => {
  let component: CheckboxEditorRendererComponent;
  let fixture: ComponentFixture<CheckboxEditorRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxEditorRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxEditorRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
