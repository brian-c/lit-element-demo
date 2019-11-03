import template from './dialog.html';
import style from './dialog.css';
import { injectBodyCss, updateScrollbarWidth, updateOpenDialogCount } from './body-scroll-handling';
import { mixInTransitions, BEFORE_SHOW, AFTER_SHOW, BEFORE_HIDE, AFTER_HIDE } from '../helpers/transition';
import { reparent } from '../helpers/reparent';

class Dialog extends HTMLElement {
	constructor() {
		super(...arguments);
		this._dismiss = this.dismiss.bind(this);

		injectBodyCss();

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>${style}</style>
			${template}
		`;

		this._underlay = this.shadowRoot.getElementById('underlay');
		this._content = this.shadowRoot.getElementById('content');
	}

	[BEFORE_SHOW]() {
		updateScrollbarWidth();
		updateOpenDialogCount(true);

		this._underlay.addEventListener('click', this._dismiss);
		document.dispatchEvent(new CustomEvent('dialog-show', { bubbles: true }));
	}

	[AFTER_SHOW]() {
		this._content.focus();
	}

	[BEFORE_HIDE]() {
		this._underlay.removeEventListener('click', this._dismiss);
	}

	[AFTER_HIDE]() {
		updateOpenDialogCount(false);
		document.dispatchEvent(new CustomEvent('dialog-hide', { bubbles: true }));
	}

	dismiss() {
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
	}
}

const EnhancedDialog = reparent(mixInTransitions(Dialog), function(dialog) {
	dialog.ownerDocument.body.append(dialog);
});

customElements.define('bc-dialog', EnhancedDialog);

export default EnhancedDialog;
