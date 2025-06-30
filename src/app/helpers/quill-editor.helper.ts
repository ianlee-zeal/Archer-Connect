import { QuillToolbarConfig, QuillModules } from 'ngx-quill';

export class QuillEditorHelper {
  private static readonly toolbar: QuillToolbarConfig = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ color: [] }],
    [{ align: ['center', 'right', 'justify'] }],
    ['clean'],
    ['link'],
  ];

  private static readonly singleLineToolbar: QuillToolbarConfig = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ script: 'sub' }, { script: 'super' }],
    [{ color: [] }],
    ['clean'],
    ['link'],
  ];

  private static readonly singleLineKeyboard = {
    bindings: {
      enter: {
        key: 13,
        handler: function () {
          return false;
        },
      },
    },
  };

  private static readonly singleLineClipboard = {
    newLines: false,
  };

  public static readonly modules: QuillModules = {
    toolbar: {
      container: QuillEditorHelper.toolbar,
      handlers: { link: QuillEditorHelper.linkHandler },
    },
  };

  public static readonly singleLineModules: QuillModules = {
    toolbar: QuillEditorHelper.singleLineToolbar,
    keyboard: QuillEditorHelper.singleLineKeyboard,
    clipboard: QuillEditorHelper.singleLineClipboard,
  } as QuillModules;

  private static linkHandler(value: any): any {
    const editor = this as any;
    const linkButton = editor.container.querySelector('.ql-link');

    if (value) {
      const range = editor.quill.getSelection();
      if (range == null || range.length === 0) {
        return;
      }
      let preview = editor.quill.getText(range);
      const { tooltip } = editor.quill.theme;
      tooltip.edit('link', preview);
      tooltip.root.style.top = `${linkButton.offsetTop}px`;
      tooltip.root.style.left = `${(linkButton.offsetLeft + linkButton.offsetWidth)}px`;
      tooltip.root.style.zIndex = 10;
    } else {
      editor.quill.format('link', false);
    }
  }
}
