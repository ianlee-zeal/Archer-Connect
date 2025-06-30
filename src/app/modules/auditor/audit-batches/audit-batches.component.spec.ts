import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditBatchesComponent } from './audit-batches.component';

describe('AuditBatchessComponent', () => {
  let component: AuditBatchesComponent;
  let fixture: ComponentFixture<AuditBatchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [AuditBatchesComponent] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
