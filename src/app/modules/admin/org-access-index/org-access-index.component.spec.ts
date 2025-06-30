import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgAccessIndexComponent } from './org-access-index.component';

describe('OrgAccessIndexComponent', () => {
  let component: OrgAccessIndexComponent;
  let fixture: ComponentFixture<OrgAccessIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgAccessIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgAccessIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
