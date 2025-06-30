import Quill from 'quill';
import Clipboard from 'quill/modules/clipboard';

const Delta = Quill.import('delta');

// code from here https://github.com/quilljs/quill/issues/1432
export class CustomClipboard extends Clipboard {
  options: any;
  quill: any;
  container: any;
  convert: any;

  public onPaste(e, htmlAndText): void {
    const self = this;
    const options = this.options;

    if (e.defaultPrevented || !this.quill.isEnabled()) {
      return;
    }

    const range = this.quill.getSelection();
    let delta = new Delta().retain(range.index);

    this.quill.container.focus();
    this.quill.selection.update(Quill.sources.SILENT);

    setTimeout(() => {
      delta = delta.concat(self.convert(htmlAndText)).delete(range.length);

      if (options.newLines === false) {
        delta.ops.map(op => {
          if (!(typeof op.insert === 'undefined')) {
            if (typeof op.insert === 'string') {
              // eslint-disable-next-line no-param-reassign
              op.insert = op.insert.replace(/(\r\n|\n|\r)/gm, ' ');
            }
          }

          return op;
        });
      }

      self.quill.updateContents(delta, Quill.sources.USER);
      // range.length contributes to delta.length()
      self.quill.setSelection(delta.length() - range.length, Quill.sources.SILENT);
      // Quill will now automatically detect the scrollable ancestor.
      self.quill.focus();
    }, 1);
  }
}
