import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentTemplatesGridActionsRendererComponent } from './document-templates-grid-actions-renderer.component';

describe('DocumentTemplatesGridActionsRendererComponent', () => {
  let component: DocumentTemplatesGridActionsRendererComponent;
  let fixture: ComponentFixture<DocumentTemplatesGridActionsRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [DocumentTemplatesGridActionsRendererComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTemplatesGridActionsRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
