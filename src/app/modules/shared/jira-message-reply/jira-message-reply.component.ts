import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { AppState } from '@app/state';
import { ActionsSubject, Store } from '@ngrx/store';
import * as actions from '@app/modules/communication-hub/state/actions';
import { Subject, takeUntil } from 'rxjs';
import { ofType } from '@ngrx/effects';
import { JiraMarkupHelper } from '@app/modules/communication-hub/jira-markup.helper';
import { JiraUser } from '@app/models/jira/jira-user';
import { QuillEditorComponent, QuillModules } from 'ngx-quill';
import { IconHelper } from '@app/helpers';
import { CommunicationHubService } from '@app/services/api/communication-hub.service';
import { FileValidatorService, PermissionService } from '@app/services';
import { UploadTile } from '@app/models/jira/jira-upload-tile';
import { JiraUploadStatus } from '@app/models/jira/jira-upload-status';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { JiraFileUploaderComponent } from '@shared/jira-file-uploader/jira-file-uploader.component';

@Component({
    selector: 'jira-message-reply',
    templateUrl: './jira-message-reply.component.html',
    styleUrl: './jira-message-reply.component.scss'
})
export class JiraMessageReplyComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChild('editor') quillEditor: QuillEditorComponent | undefined;
    @ViewChild(JiraFileUploaderComponent) fileUploader?: JiraFileUploaderComponent;
    @Input() public assignee: JiraUser;
    @Input() public ticketKey: string;

    private ngUnsubscribe$ = new Subject<void>();

    private fileCount: number = 0;
    public exceedsFileLimit: boolean = false;
    private composeFiles: UploadTile[] = [];
    private readonly maxFileSize: number = 50 * 1024 * 1024;

    descriptionPlaceholder: string = "";
    descriptionEnabled: boolean = false;
    buttonAdded: boolean = false;
    jiraMarkupHelper = new JiraMarkupHelper();
    sendButtonRef!: HTMLButtonElement;
    public canAttachFiles = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ANDIMessaging, PermissionActionTypeEnum.ANDIAttachments));

    content: string;

    editorModules: QuillModules = JiraMarkupHelper.editorModules;

    enabledCss: string = `
            background-color: #050041;
            color: #FFFFFF;
            border-radius: 60px;
            font-size: 14px;
            padding: 8px 30px 8px 30px;
            float: right;
            width: auto;
            height: auto;
        `;

    disabledCss: string = `
            background-color: #050041;
            color: #FFFFFF;
            border-radius: 60px;
            font-size: 14px;
            padding: 8px 30px 8px 30px;
            float: right;
            width: auto;
            height: auto;
            font-weight: 700;
            background: rgba(160, 160, 160, 0.71);
            cursor: not-allowed;    
        `;

    constructor(
        protected readonly store: Store<AppState>,
        private readonly actionsSubj: ActionsSubject,
        private readonly fileValidatorService: FileValidatorService,
        private readonly communicationHubService: CommunicationHubService,
        private readonly permissionService: PermissionService,
    ) { }

    ngOnInit() {
        this.descriptionEnabled = false;
        this.actionsSubj.pipe(
            takeUntil(this.ngUnsubscribe$),
            ofType(
                actions.CreateJiraReplySuccess,
                actions.Error,
            ),
        ).subscribe(() => {
            this.descriptionEnabled = false;
            this.buttonAdded = false;
            this.content = '';
            if (this.quillEditor) {
                const quill = this.quillEditor.quillEditor;
                quill.setText('');
            }
            this.composeFiles = [];
            this.fileUploader?.clearFiles();
            this.sendButtonOnChange();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['ticketKey'] && !changes['ticketKey'].firstChange) {
            this.descriptionEnabled = false;
        }
    }

    get isDescriptionEnabled(): boolean {
        return this.descriptionEnabled;
    }

    onEditorCreated() {
        const toolbar = document.querySelector('.ql-toolbar');

        if (toolbar && !toolbar.querySelector('.toolbar-btn')) {
            this.addToolbarButton(toolbar);
            this.sendButtonOnChange();
            this.buttonAdded = true;
        }
    }

    onContentChanged() {
        this.sendButtonOnChange();
    }

    sendButtonOnChange(): void {
        if (!this.sendButtonRef) {
            return;
        }

        const contentLength = this.jiraMarkupHelper.getHtmlLength(this.content);
        const hasContent = contentLength >= 2;
        const allFilesAreValid = this.composeFiles.length === 0 || this.composeFiles.every(tile => tile.status === JiraUploadStatus.Success);
        const enableSend = hasContent && allFilesAreValid;

        this.sendButtonRef.disabled = !enableSend;
        this.sendButtonRef.style.cssText = enableSend ? this.enabledCss : this.disabledCss;
    }

    addToolbarButton(toolbar: any): void {
        const button = document.createElement('button');
        button.innerText = 'Send';
        button.style.cssText = this.disabledCss;

        button.onclick = () => this.sendReply();
        button.onchange = () => this.sendButtonOnChange();
        button.disabled = true;

        toolbar.appendChild(button);
        this.sendButtonRef = button;
    }

    enableDescription(): void {
        this.descriptionEnabled = true;
    }

    sendReply(): void {
        this.store.dispatch(actions.CreateJiraReply({
            data:
            {
                body: this.jiraMarkupHelper.parseHtmlToMarkdown(this.content),
                ticketKey: this.ticketKey,
                temporaryAttachmentIds: this.composeFiles
                    .filter(file => file.fileUploadedId != null)
                    .map(file => file.fileUploadedId)
            }
        }));
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
        this.composeFiles = [];
        this.fileUploader?.clearFiles();
    }

    protected get getComposeFiles(): UploadTile[] {
        return this.composeFiles;
    }

    onFilesSelected(tiles: UploadTile[]) {
        this.composeFiles = tiles;
        this.sendButtonOnChange();
    }


    protected readonly IconHelper = IconHelper;
}
