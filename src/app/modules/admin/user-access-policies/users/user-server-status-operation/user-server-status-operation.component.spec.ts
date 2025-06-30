import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserServerStatusOperationComponent } from './user-server-status-operation.component';

describe('UserServerStatusOperationComponent', () => {
  let component: UserServerStatusOperationComponent;
  let fixture: ComponentFixture<UserServerStatusOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserServerStatusOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserServerStatusOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
