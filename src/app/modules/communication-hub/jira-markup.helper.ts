import { QuillModules } from 'ngx-quill';
import Delta from 'quill-delta';

export class JiraMarkupHelper {

  public parseHtmlToMarkdown(html: string): string {
    if (!html) {
      return '';
    }

    let markdown = html;

    markdown = this.parseList(markdown);

    // Replace heading tags
    markdown = markdown.replace(/<h1>/g, 'h1. ').replace(/<\/h1>/g, '\n');
    markdown = markdown.replace(/<h2>/g, 'h2. ').replace(/<\/h2>/g, '\n');
    markdown = markdown.replace(/<h3>/g, 'h3. ').replace(/<\/h3>/g, '\n');
    markdown = markdown.replace(/<h4>/g, 'h4. ').replace(/<\/h4>/g, '\n');

    // Replace formatting tags
    markdown = this.parseAll(markdown, 'strong', '*');
    markdown = this.parseAll(markdown, 'em', '_');
    markdown = this.parseAll(markdown, 'u', '+');

    // Decode HTML entities
    markdown = markdown.replace(/&gt;/g, '>');
    markdown = markdown.replace(/&amp;/g, '&');

    // Convert plain 'www.' URLs to full links
    markdown = markdown.replace(/\b(?<!https:\/\/)(www\.[^\s<]+)/g, 'https://$1');

    // Clean <p> and <br> into proper lines
    markdown = markdown
      .replace(/&nbsp;/g, ' ')
      .replace(/<p><br><\/p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/p>/g, '\n')
      .replace(/<p>/g, '');

    // Clean blockquotes
    markdown = markdown
      .replace(/<blockquote>/g, '> ')
      .replace(/<\/blockquote>/g, '');

    return markdown.trim();
  }

  private parseList(html: string): string {
    if (!html.includes('<ul>') && !html.includes('<ol>')) {
      return html;
    }

    const getAllListsRegex = /<ol>[\s\S]*?<\/ol>|<ul>[\s\S]*?<\/ul>/gi;
    const listMatches: string[] = [];

    for (
      let match = getAllListsRegex.exec(html);
      match !== null;
      match = getAllListsRegex.exec(html)
    ) {
      listMatches.push(match[0]);
    }

    for (const listHtml of listMatches) {
      const template = document.createElement('template');
      template.innerHTML = listHtml;

      const listMarkdown = this.convertListElement(template.content).trim();

      // Always add two line breaks around lists
      html = html.replace(listHtml, `\n\n${listMarkdown}\n\n`);
    }

    return html;
  }

  private convertListElement(node: Node, indentLevel: number = 0): string {
    let markdown = '';

    node.childNodes.forEach(child => {
      if (child instanceof HTMLUListElement || child instanceof HTMLOListElement) {
        markdown += this.convertListElement(child, indentLevel);
      } else if (child instanceof HTMLLIElement) {
        const isOrderedList = child.parentElement instanceof HTMLOListElement;
        const prefix = (isOrderedList ? '#'.repeat(indentLevel + 1) : '*'.repeat(indentLevel + 1));
        const itemTextParts: string[] = [];

        child.childNodes.forEach(inner => {
          if (
            inner.nodeType === Node.TEXT_NODE ||
            inner instanceof HTMLElement && !(inner instanceof HTMLUListElement || inner instanceof HTMLOListElement)
          ) {
            itemTextParts.push(inner.textContent?.trim() ?? '');
          }
        });

        const itemText = itemTextParts.join(' ').trim();
        if (itemText) {
          markdown += `${prefix} ${itemText}\n`;
        }

        child.childNodes.forEach(inner => {
          if (inner instanceof HTMLUListElement || inner instanceof HTMLOListElement) {
            markdown += this.convertListElement(inner, indentLevel + 1);
          }
        });
      }
    });

    return markdown;
  }

  private parseAll(html: string, htmlTag: string, markdownEquivalent: string): string {
    const regEx = new RegExp(`<${htmlTag}>(.*?)<\/${htmlTag}>`, 'gis');

    return html.replace(regEx, (_, content) => {
      const trimmedContent = content.trim();
      return `${markdownEquivalent}${trimmedContent}${markdownEquivalent}`;
    });
  }


  public htmlToElements(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
  }

  public getHtmlLength(html: string): number {
    if (!html) {
      return 0;
    }

    let nodes = this.htmlToElements(html);
    return Array.from(nodes).reduce((length, node) => length + node.textContent.trim().length, 0);
  }

  public static editorModules: QuillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ header: [1, 2, 3, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ],
    clipboard: {
      matchVisual: false,
      matchers: [
        [Node.ELEMENT_NODE, (node: any) => {
          const plainText = node.textContent;
          return new Delta().insert(plainText);
        }]
      ]
    }
  };
}