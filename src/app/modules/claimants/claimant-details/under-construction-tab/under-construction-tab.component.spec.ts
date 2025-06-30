import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderConstructionTabComponent } from './under-construction-tab.component';

describe('UnderConstructionTabComponent', () => {
  let component: UnderConstructionTabComponent;
  let fixture: ComponentFixture<UnderConstructionTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnderConstructionTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnderConstructionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
