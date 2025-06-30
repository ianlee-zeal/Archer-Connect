import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ANDIMessagingSectionComponent } from './andi-messaging-section.component';

describe('CommunicationHubSectionComponent', () => {
  let component: ANDIMessagingSectionComponent;
  let fixture: ComponentFixture<ANDIMessagingSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ANDIMessagingSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ANDIMessagingSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
