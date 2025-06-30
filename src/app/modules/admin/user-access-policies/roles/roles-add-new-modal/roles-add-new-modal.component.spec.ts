import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesAddNewModalComponent } from './roles-add-new-modal.component';

describe('RolesAddNewModalComponent', () => {
  let component: RolesAddNewModalComponent;
  let fixture: ComponentFixture<RolesAddNewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolesAddNewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesAddNewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
