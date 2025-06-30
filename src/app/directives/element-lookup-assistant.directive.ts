import { Directive, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { replacementRulesMap } from 'cypress/export';

const TEST_ID_ATTR = 'data-test-id';
const TEST_PARAMS_ATTR = 'data-test-params';
const PSEUDO_ID_ATTR = 'data-test-pseudo-id';
const PSEUDO_NAME_ATTR = 'data-test-pseudo-name';

const HELPER_ACTIVE_CLASS = 'ela-active';
const TOOLTIP_INVERTED_CLASS = 'ela-inverted';
const UPDATE_SERVICE_ATTRS_INTERVAL = 3000;

@Directive({ selector: '[element-lookup-assistant]' })
export class ElementLookupAssistantDirective implements OnInit, OnDestroy {
  private attachInterval;
  private listeners: Array<() => void>;

  public constructor(private renderer: Renderer2) {}

  ngOnInit() {
    if (environment.real_production) return;
    this.listeners = [
      this.renderer.listen(document, 'keydown.Control.Alt.T', this.onHelperToggle),
      this.renderer.listen(document, 'keydown.Control.I', this.onTooltipPositionToggle),
    ];
  }

  ngOnDestroy() {
    // Unsubscribe
    this.listeners.forEach(listener => listener());
  }

  private onHelperToggle = () => {
    if (document.body.classList.contains(HELPER_ACTIVE_CLASS)) {
      document.body.classList.remove(HELPER_ACTIVE_CLASS);
      document.removeEventListener('click', this.onGlobalClick);
      clearInterval(this.attachInterval);
    } else {
      document.body.classList.add(HELPER_ACTIVE_CLASS);
      document.addEventListener('click', this.onGlobalClick);
      this.attachInterval = setInterval(this.attachServiceAttrs, UPDATE_SERVICE_ATTRS_INTERVAL);
      this.attachServiceAttrs();
    }
  }

  private onTooltipPositionToggle = () => {
    document.body.classList.toggle(TOOLTIP_INVERTED_CLASS);
  }

  private onGlobalClick = event => {
    const targetEl = event.target;
    if (targetEl?.hasAttribute(TEST_ID_ATTR) || targetEl?.hasAttribute(PSEUDO_ID_ATTR)) {
      event.preventDefault();
      event.stopPropagation();

      if (event.ctrlKey) { // copy full pseudo-path if ctrl is pressed
        const isPseudo = targetEl.hasAttribute(PSEUDO_ID_ATTR);
        const parents = $(targetEl).parents()
          .filter((i, parentEl) => (
            parentEl.hasAttribute(TEST_ID_ATTR) ||
            isPseudo && parentEl.hasAttribute(PSEUDO_ID_ATTR)
          ))
          .toArray();

        const pseudoQuery = [...parents.reverse(), targetEl]
          .map(el => this.extractPseudoSelector(el))
          .join(' ');

        this.copyToClipboard(pseudoQuery);
      } else {
        const pseudoSelector = this.extractPseudoSelector(targetEl);
        this.copyToClipboard(pseudoSelector);
      }
    }
  }

  ///

  private attachServiceAttrs = () => {
    this.attachPseudoAttrs();
    this.attachParamsAttrs();
  }

  private attachPseudoAttrs() {
    for (let pseudoSelector in replacementRulesMap) {
      const rawSelector = replacementRulesMap[pseudoSelector];
      const selector = rawSelector.replace(/=?\$name/gi, '');
      const pseudoId = pseudoSelector.replace(/=\$name/gi, '');

      $(selector).each((index, el) => {
        el.setAttribute(PSEUDO_ID_ATTR, pseudoId);
        if (rawSelector.includes('$name') && !el.hasAttribute(PSEUDO_NAME_ATTR)) {
          this.setPseudoNameAttr(el, selector);
        }
        if (!el.hasAttribute(TEST_PARAMS_ATTR)) {
          this.setTestParamsAttr(el);
        }
      });
    }
  }

  private attachParamsAttrs(): void {
    const elements = $(`[${TEST_ID_ATTR}]`).toArray();
    for (let el of elements) {
      if (el.hasAttribute(TEST_PARAMS_ATTR)) continue;
      this.setTestParamsAttr(el);
    }
  }

  private setPseudoNameAttr(el: HTMLElement, selector: string): void {
    switch (true) {
      case selector.endsWith(':contains()'): {
        const name = `"${el.textContent.trim().replace(/\s+/g, ' ')}"`;
        el.setAttribute(PSEUDO_NAME_ATTR, name);
        break;
      }
      case /\[[a-z0-9_\-]+\]$/.test(selector): {
        const [,nameAttr] = /\[([a-z0-9_\-]+)\]$/.exec(selector)
        const name = `"${el.getAttribute(nameAttr)}"`;
        el.setAttribute(PSEUDO_NAME_ATTR, name);
        break;
      }
    }
  }

  private setTestParamsAttr(el: HTMLElement): void {
    const paramsList = el.getAttributeNames()
      .map(attrName => /^data-test-(?<paramName>.+)-spec$/.exec(attrName))
      .filter(Boolean)
      .map(match => `${match.groups.paramName}=${el.getAttribute(match.input)}`);

    if (paramsList.length) {
      el.setAttribute(TEST_PARAMS_ATTR, `%(${paramsList.join(',')})`);
    }
  }

  private extractPseudoSelector(el: HTMLElement): string {
    const {content} = window.getComputedStyle(el, '::before');
    return content.slice(1, -1).replace(/\\/g, '');
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard?.writeText(text);
  }

}
