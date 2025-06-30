import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DragAndDropModernComponent } from './drag-and-drop-modern.component';

describe('UploadFileComponent', () => {
  let component: DragAndDropModernComponent;
  let fixture: ComponentFixture<DragAndDropModernComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DragAndDropModernComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DragAndDropModernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
