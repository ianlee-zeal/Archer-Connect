import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTemplatesPageComponent } from './document-templates-page.component';

describe('DocumentTemplatesPageComponent', () => {
  let component: DocumentTemplatesPageComponent;
  let fixture: ComponentFixture<DocumentTemplatesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTemplatesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTemplatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
