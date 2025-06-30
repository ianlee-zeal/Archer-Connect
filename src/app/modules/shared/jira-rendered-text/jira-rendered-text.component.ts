import { AfterViewInit, Component, ElementRef, Input, Output, OnChanges, Renderer2, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import * as actions from '@app/modules/communication-hub/state/actions';

/**
 * Template for rendering Jira text with rich format and allowing attachment download
 *
 * @export
 * @class JiraRenderedTextComponent
 */

@Component({
  selector: 'jira-rendered-text',
  templateUrl: './jira-rendered-text.component.html',
  styleUrls: ['./jira-rendered-text.component.scss']
})
export class JiraRenderedTextComponent implements AfterViewInit, OnChanges {
  @ViewChild('contentWrapper', { static: false }) contentWrapperRef: ElementRef;

  @Input() set content(value: string) {
    this._content = this.cleanContent(value);
  }

  @Input() showExpandToggle: boolean = false;
  @Input() isExpanded: boolean = false;
  @Output() toggle: EventEmitter<void> = new EventEmitter<void>();

  get content(): string {
    return this._content;
  }

  protected shouldShowExpandToggle: boolean = false;
  private readonly collapsedMaxHeight: number = 100;
  private _content = '';

  constructor(protected readonly store: Store<AppState>, private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.content) {
      this.deferContentHeightCheck();
    }
  }

  ngAfterViewInit(): void {
    const container = this.el.nativeElement.querySelector('.ql-editor');
    if (container) {
      this.attachLinkListeners(container);
      this.deferContentHeightCheck();
    }
  }

  attachLinkListeners(container: HTMLElement): void {
    container.querySelectorAll('a').forEach((link: HTMLAnchorElement) => {
      this.renderer.listen(link, 'click', (event: MouseEvent) => {
        event.preventDefault();
        this.handleLinkClick(link.href);
      });
    });
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

  toggleView(): void {
    this.toggle.emit();
  }

  /**
   * Evaluates whether the "View more" toggle should be shown based on content height.
   *
   * This function compares the actual scroll height of the content wrapper
   * against its max-height style value. If the content overflows significantly
   * (by more than 20px), and non-empty text content exists, it enables the toggle.
   *
   * This prevents showing the expand option when the content is small or whitespace-only.
   */
  checkContentHeight(): void {
    if (!this.showExpandToggle) {
      this.shouldShowExpandToggle = false;
      return;
    }

    const wrapper = this.contentWrapperRef?.nativeElement;
    if (!wrapper) {
      return;
    }

    const fullHeight = wrapper.scrollHeight;
    const maxHeight = parseInt(getComputedStyle(wrapper).maxHeight, 10) || this.collapsedMaxHeight;
    const actualContent = wrapper.textContent?.trim() || '';
    const contentExists = actualContent.length > 0;
    const heightDiff = fullHeight - maxHeight;

    this.shouldShowExpandToggle = contentExists && heightDiff > 20;
  }

  onCopy(event: ClipboardEvent) {
    const selection = window.getSelection();

    if (selection) {
      const selectedHtml = selection.toString();
      const plainText = this.stripHtmlTags(selectedHtml);

      if (event.clipboardData) {
        event.clipboardData.setData('text/plain', plainText);
        event.preventDefault();
      }
    }
  }

  private stripHtmlTags(html: string): string {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || '';
  }

  private cleanContent(html: string): string {
    return html
      .replace(/<p><\/p>/g, '')
      .replace(/<p><br><\/p>/g, '')
      .replace(/(&nbsp;|\s)*<p><br><\/p>/g, '')
      .replace(/(\r?\n){2,}/g, '\n');
  }

  private deferContentHeightCheck(): void {
    setTimeout(() => this.checkContentHeight(), 0);
  }
}
