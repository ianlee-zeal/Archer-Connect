import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownEditorRendererComponent } from './dropdown-editor-renderer.component';

describe('DropdownEditorRendererComponent', () => {
  let component: DropdownEditorRendererComponent;
  let fixture: ComponentFixture<DropdownEditorRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownEditorRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownEditorRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
