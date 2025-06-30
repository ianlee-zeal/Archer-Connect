import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'search-box',
    templateUrl: './search-box.component.html',
    styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent implements OnInit, OnDestroy {

    @Input() userId: number;
    @Output() onModelChange = new EventEmitter<any>();

    public searchTextChanged$: Subject<string> = new Subject<string>();
    public searchText: string = '';

    private ngUnsubscribe$ = new Subject<void>();

    public ngOnInit(): void {

        this.searchTextChanged$
            .pipe(
                debounceTime(1000),
                distinctUntilChanged(),
                takeUntil(this.ngUnsubscribe$)
            )
            .subscribe(searchText => {
                if (!searchText || searchText.trim() === '') {
                    this.resetSearch();
                    return;
                }
                this.searchText = searchText;
                this.onModelChange.emit(this.searchText);
            });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    public resetSearch(): void {
        this.clearText();
        this.searchTextChanged$.next('');
        this.onModelChange.emit(this.searchText);
    }

    public clearText(){
        this.searchText = '';
    }
}
