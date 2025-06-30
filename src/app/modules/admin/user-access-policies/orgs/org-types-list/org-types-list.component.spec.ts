import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgTypesListComponent } from './org-types-list.component';

describe('OrgTypesListComponent', () => {
  let component: OrgTypesListComponent;
  let fixture: ComponentFixture<OrgTypesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgTypesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
