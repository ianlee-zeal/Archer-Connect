import { Directive, ElementRef, HostListener, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ToastService } from '@app/services';
import { ofType } from '@ngrx/effects';
import { Action, ActionsSubject } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as rootActions from '../state/root.actions';

/**
 * Directive for regular submit buttons which execute async operations on click.
 *
 * Steps:
 * 1. On the first click button is disabled and spinner within the button is shown (spinner could be disabled by flag).
 * 2. Subscriptions for the provided async action types are created.
 * 3. When any of the provided action types is called, spinner is hidden again, button is enabled back, subscriptions are destroyed.
 *
 * @export
 * @class AsyncButtonDirective
 * @implements {OnDestroy}
 */
@Directive({ selector: '[asyncButton]' })
export class AsyncButtonDirective implements OnDestroy {
  private subscription: Subscription;
  private intervalId: NodeJS.Timeout;

  /**
   * Gets or sets an array of awaited async action types
   *
   * @type {string[]}
   * @memberof AsyncButtonDirective
   */
  @Input() awaitedActionTypes: string[] = null;

  /**
   * Gets or sets the flag indicating whether spinner is enabled for button or not.
   *
   * @memberof AsyncButtonDirective
   */
  @Input() isSpinnerEnabled = true;

  @Input() indicateLongLoad = false;
  @Input() indicateLongLoadPeriod = 20000;

  /**
   * Event fired when async operation is finished.
   *
   * Fired with the action type value.
   *
   * @memberof AsyncButtonDirective
   */
  @Output()
  readonly asyncFinished = new EventEmitter<Action>();

  /**
   * Subscription on click event for the button element
   *
   * @memberof AsyncButtonDirective
   */
  @HostListener('click')
  onClick(): void {
    if (!this.button.disabled && this.awaitedActionTypes !== null && this.awaitedActionTypes.length > 0) {
      if (this.indicateLongLoad) {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
          this.toaster.showInfo('Saving... Please wait.');
        }, this.indicateLongLoadPeriod);
      }

      this.subscribeToActionTypes([
        rootActions.Error.type,
        ...this.awaitedActionTypes,
      ]);
      this.toggle(true);
    }
  }

  /**
   * Returns current button element as a strong typed element.
   *
   * @readonly
   * @private
   * @type {HTMLButtonElement}
   * @memberof AsyncButtonDirective
   */
  private get button(): HTMLButtonElement {
    return this.element.nativeElement as HTMLButtonElement;
  }

  /**
   *  Creates an instance of AsyncButtonDirective.
   * @param {ElementRef} element
   * @param {ActionsSubject} actionsSubject
   * @memberof AsyncButtonDirective
   */
  constructor(
    private readonly element: ElementRef,
    private readonly actionsSubject: ActionsSubject,
    private toaster: ToastService,
  ) {}

  /**
   * Toggles disabled flag for the button element and toggles spinner element if necessary.
   *
   * @private
   * @param {boolean} disable
   * @memberof AsyncButtonDirective
   */
  private toggle(disable: boolean) {
    if (this.isSpinnerEnabled && this.button.children && this.button.children[0]) {
      const classList = this.button.children[0].classList;
      if (disable) {
        classList.remove('hidden');
      } else {
        classList.add('hidden');
      }
    }
    this.button.disabled = disable;
  }

  /**
   * Creates a subscription for provided action types.
   *
   * @private
   * @param {string[]} actionTypes
   * @memberof AsyncButtonDirective
   */
  private subscribeToActionTypes(actionTypes: string[]) {
    this.ngOnDestroy();
    this.subscription = this.actionsSubject.pipe(
      ofType(...actionTypes),
    ).subscribe(action => {
      if (this.button.disabled) {
        this.toggle(false);
        if (this.indicateLongLoad) {
          clearInterval(this.intervalId);
        }
        this.asyncFinished.emit(action);
        this.ngOnDestroy();
      }
    });
  }

  /** @inheritdoc */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
