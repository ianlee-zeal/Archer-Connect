import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-input-box',
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.scss'
})
export class InputBoxComponent implements AfterViewInit {

  @Input() label: string = '';
  @Input() fontSize?: number = 16;
  @Input() format: string = 'text';
  @Input() required: boolean = false;
  @Output() onModelChange = new EventEmitter<any>();
  public textValueChanged$: Subject<string> = new Subject<string>();

  textValue: string = '';

  ngAfterViewInit() {
    this.textValueChanged$
      .subscribe(text => {
        this.textValue = text;
        this.onModelChange.emit(this.textValue);
      });
  }
}
