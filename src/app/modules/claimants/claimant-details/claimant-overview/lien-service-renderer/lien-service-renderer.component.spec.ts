import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LienServiceRendererComponent } from './lien-service-renderer.component';

describe('LienServiceRendererComponent', () => {
  let component: LienServiceRendererComponent;
  let fixture: ComponentFixture<LienServiceRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LienServiceRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LienServiceRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
