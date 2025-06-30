import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class KeyboardEventService {
  private windowKeyEvent: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();

  public setEvent(event: KeyboardEvent) {
    this.windowKeyEvent.next(event);
  }

  public getSubscription(elementRef: ElementRef): Observable<KeyboardEvent> {
    return this.windowKeyEvent.pipe(
      filter(event => elementRef.nativeElement.contains(event.target)),
    );
  }

}
