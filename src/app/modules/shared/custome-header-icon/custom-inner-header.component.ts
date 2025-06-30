import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { IHeaderAngularComp } from 'ag-grid-angular';
import type { IHeaderParams } from 'ag-grid-community';


export interface ICustomInnerHeaderParams {
    icon:string;
}

@Component({
    changeDetection:ChangeDetectionStrategy.OnPush,

    template:`
        <div class="customInnerHeader">
        <span>{{ displayName() }}</span>
              @if (icon()) {
                <i class="fa {{ icon() }}" title="Checked accounts will be &#10;added/updated on ledgers via nightly  &#10; automation job from fee source data"></i>
              }
        </div>`,
        styles: [
        `.customInnerHeader {
                display: flex;
                gap: 0.25rem;
                align-items: center;
            }

            .customInnerHeader span {
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .fa {
                color: cornflowerblue;
            }`,
    ],
})

export class CustomInnerHeaderComponent implements IHeaderAngularComp{
icon = signal('');
    displayName = signal('');

    agInit(params: IHeaderParams & ICustomInnerHeaderParams): void {
        this.icon.set(params.icon);
        this.displayName.set(params.displayName);
    }

    refresh(_params: IHeaderParams): boolean {
        return false;
    }
}