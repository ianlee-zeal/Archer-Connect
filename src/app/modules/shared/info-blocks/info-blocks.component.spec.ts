import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBlocksComponent } from './info-blocks.component';

describe('InfoBlocksComponent', () => {
  let component: InfoBlocksComponent;
  let fixture: ComponentFixture<InfoBlocksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoBlocksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
