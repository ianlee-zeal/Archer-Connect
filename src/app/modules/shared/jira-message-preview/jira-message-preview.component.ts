import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { JiraComment } from '@app/models/jira/jira-comment';
import { JiraIssue } from '@app/models/jira/jira-issue';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import * as actions from '@app/modules/communication-hub/state/actions';

@Component({
  selector: 'jira-message-preview',
  templateUrl: './jira-message-preview.component.html',
  styleUrl: './jira-message-preview.component.scss',
})
export class JiraMessagePreviewComponent {
  @Input() public data: JiraIssue;

  @Input() public comments: JiraComment[];

  @Input() public showFullScreenIcon: boolean;

  expandedCommentIndex: number | null = null;

  constructor(private router: Router, protected readonly store: Store<AppState>) { }

  toggleExpand(index: number): void {
    if (this.expandedCommentIndex === index) {
      this.expandedCommentIndex = null;
    } else {
      this.expandedCommentIndex = index;
    }
  }

  public viewMessage(): void {
    this.router.navigate(['/andi-messaging/message', this.data.id]);
  }

  handleLinkClick(url: string): void {
    if (url.includes('attachment')) {
      this.triggerDownload(url);
    } else {
      window.open(url, '_blank');
    }
  }

  triggerDownload(url: string): void {
    const attachmentId = this.extractAttachmentId(url);
    this.store.dispatch(actions.DownloadAttachment({ attachmentId: attachmentId }));
  }

  extractAttachmentId(url): number {
    const match = url.match(/#attachment-(\d+)/);
    return match ? parseInt(match[1]) : null;
  }
}
