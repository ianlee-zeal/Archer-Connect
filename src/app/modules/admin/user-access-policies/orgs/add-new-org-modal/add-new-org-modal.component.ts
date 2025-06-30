import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, Subject, debounceTime, switchMap } from 'rxjs';
import { ToastService, ValidationService } from '@app/services';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { RatingEnum } from '@app/models/enums/rating.enum';
import { orgTypesSelectors } from '@app/modules/admin/user-access-policies/orgs/state/selectors';
import { ValidationForm } from '../../../../shared/_abstractions/validation-form';
import * as fromRoot from '../../../../../state';
import * as userAccessPolicyActions from '../state/actions';
import * as fromUserAccessPolicies from '../state';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap/typeahead/typeahead';

@Component({
  selector: 'app-add-new-org-modal',
  templateUrl: './add-new-org-modal.component.html',
  styleUrls: ['./add-new-org-modal.component.scss'],
})
export class AddNewOrgModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public item: UntypedFormGroup;
  public ngDestroyed$ = new Subject<void>();
  public error$ = this.store.select(fromUserAccessPolicies.error);
  public orgTypesValues$ = this.store.select(fromRoot.organizationTypeDropdownValues);
  public orgsOptions$ = this.store.select(orgTypesSelectors.searchOrganizationNames);

  public readonly awaitedActionTypes = [
    userAccessPolicyActions.GoToOrg.type,
    userAccessPolicyActions.Error.type,
    FormInvalid.type,
  ];

  constructor(
    private store: Store<fromRoot.AppState>,
    private fb: UntypedFormBuilder,
    public modal: BsModalRef,
    private toaster: ToastService,
    private renderer: Renderer2,
  ) {
    super();
  }

  search = (text$: Observable<string>) => text$.pipe(
    debounceTime(500),
    switchMap(() => this.filterOptions()),
  );

  public ngOnInit(): void {
    this.item = this.fb.group({
      name: ['', [ValidationService.noWhitespaceBeforeTextValidator, Validators.minLength(4), Validators.maxLength(255)], autoFocusFieldAsyncValidator],
      primaryOrgTypeId: [null, Validators.required],
      satisfactionRatingId: RatingEnum.Neutral,
    });
    this.applyStyleAfterContainerIsRendered();
  }

  onItemClick(event: NgbTypeaheadSelectItemEvent): void {
    // Prevent the default action of selecting the item
    event.preventDefault();
    // You can add any additional logic here if needed
  }

  applyStyleAfterContainerIsRendered(): void {
    const observer = new MutationObserver((mutationsList, observer) => {
      // Iterate through each mutation
      for (const mutation of mutationsList) {
        // Check if nodes were added
        if (mutation.type === 'childList') {
          // Iterate through each added node
          mutation.addedNodes.forEach(node => {
            // Check if the added node is the one you're interested in
            if (node instanceof HTMLElement && node.id === 'ngb-typeahead-0') {
              // Do something with the added node
              this.renderer.setStyle(node, 'max-height', '180px');
              this.renderer.setStyle(node, 'overflow-y', 'scroll');
              observer.disconnect();
            }
          });
        }
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
  }

  filterOptions(): Observable<any[]> {
    return this.orgsOptions$.pipe(options => options);
  }

  protected get validationForm(): UntypedFormGroup {
    return this.item;
  }

  public save(): void {
    if (super.validate()) {
      this.store.dispatch(userAccessPolicyActions.AddOrg({
        item: this.item.value,
        callback: this.onSaveSuccess.bind(this),
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(FormInvalid());
    }
  }

  private onSaveSuccess(data): void {
    this.modal.hide();
    this.store.dispatch(userAccessPolicyActions.GoToOrg({ id: data.id }));
  }

  searchOrganizations(name: string): void {
    if (name !== undefined || name !== '') {
      this.store.dispatch(userAccessPolicyActions.SearchOrganizationsByNameRequest({ name }));
    }
  }

  public cancel(): void {
    this.modal.hide();
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
