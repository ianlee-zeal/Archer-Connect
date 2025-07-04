import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDocumentModalComponent } from './upload-document-modal.component';

describe('UploadDocumentModalComponent', () => {
  let component: UploadDocumentModalComponent;
  let fixture: ComponentFixture<UploadDocumentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDocumentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
