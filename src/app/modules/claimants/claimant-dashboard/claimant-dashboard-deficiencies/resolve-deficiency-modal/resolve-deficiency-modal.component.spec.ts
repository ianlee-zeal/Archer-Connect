import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolveDeficienciesModalComponent } from './resolve-deficiency-modal.component';

describe('ResolveDeficiencyModalComponent', () => {
  let component: ResolveDeficienciesModalComponent;
  let fixture: ComponentFixture<ResolveDeficienciesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResolveDeficienciesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolveDeficienciesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
