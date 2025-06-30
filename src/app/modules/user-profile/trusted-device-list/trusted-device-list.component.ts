import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Device } from '@app/models/device';
import { UntypedFormArray, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-trusted-device-list',
  templateUrl: './trusted-device-list.component.html',
  styleUrls: ['./trusted-device-list.component.scss']
})
export class TrustedDeviceListComponent implements OnInit {

  @Input() devices: Device[];
  @Input() canEdit: boolean;
  @Input() width: number;
  @Input() labelWidth: number;

  @Output() public devicesChanged = new EventEmitter <Device[]>();

  public get deviceListGroup(): UntypedFormArray {
    return this.form.get('deviceList') as UntypedFormArray;
  }

  public set deviceListGroup(value: UntypedFormArray) {
    this.form.controls.deviceList = value;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    deviceList: new UntypedFormArray([]),
  });

  constructor() { }

  ngOnInit() {
    if(this.devices){
      this.initForm(this.devices)
    }

    this.form.controls.deviceList.valueChanges.subscribe( devices => {
      this.devicesChanged.emit(devices)
    })
  }

  private initForm(devices: Device[] = null) {
    this.form.controls.deviceList = new UntypedFormArray([]);

    devices.forEach(device => {
      this.deviceListGroup.push(this.createGroup(device));
    });
  }

  private createGroup(device: Device): UntypedFormGroup {
    return new UntypedFormGroup({
      userId: new UntypedFormControl(device.userId),
      deviceName: new UntypedFormControl(device.deviceName, [Validators.required]),
      deviceId: new UntypedFormControl(device.deviceId),
    });
  }

  public deleteDevice(index: number): void {
    this.devices.splice(index, 1);
    this.initForm(this.devices);
    this.devicesChanged.emit(this.devices)
  }

}
