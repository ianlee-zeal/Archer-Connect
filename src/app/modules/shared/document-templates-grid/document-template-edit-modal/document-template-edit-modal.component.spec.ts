import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTemplateEditModalComponent } from './document-template-edit-modal.component';

describe('DocumentTemplateEditModalComponent', () => {
  let component: DocumentTemplateEditModalComponent;
  let fixture: ComponentFixture<DocumentTemplateEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTemplateEditModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTemplateEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
