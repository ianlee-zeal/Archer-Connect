import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemFieldsSectionComponent } from './system-fields-section.component';

describe('SystemFieldsSectionComponent', () => {
  let component: SystemFieldsSectionComponent;
  let fixture: ComponentFixture<SystemFieldsSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemFieldsSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemFieldsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
