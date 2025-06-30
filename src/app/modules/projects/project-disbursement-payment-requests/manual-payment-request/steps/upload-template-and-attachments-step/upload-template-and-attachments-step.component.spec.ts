import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadTemplateAndAttachmentsStepComponent } from './upload-template-and-attachments-step.component';

describe('UploadTemplateAndAttachmentsStepComponent', () => {
  let component: UploadTemplateAndAttachmentsStepComponent;
  let fixture: ComponentFixture<UploadTemplateAndAttachmentsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadTemplateAndAttachmentsStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadTemplateAndAttachmentsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
