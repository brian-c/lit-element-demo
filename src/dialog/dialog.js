import AutoMover from '../helpers/auto-mover';
import template from './dialog.html';
import style from './dialog.css';

const BODY_STYLE_ID = 'dialog-body-styles';

function updateScrollbarWidth() {
	const scrollParent = document.createElement('div');
	const scrollChild = document.createElement('div');
	scrollParent.style.overflow = 'scroll';
	scrollParent.append(scrollChild);
	document.body.append(scrollParent);
	const scrollbarWidth = scrollParent.offsetWidth - scrollChild.offsetWidth;
	scrollParent.remove();
	document.documentElement.style.setProperty('--dialog-scrollbar-width', `${scrollbarWidth}px`)
}

function injectBodyCss() {
	document.body.insertAdjacentHTML('afterBegin', `
		<style id="${BODY_STYLE_ID}">
			body[data-dialog-open-count] {
				overflow: hidden;
				padding-right: var(--dialog-scrollbar-width, 0);
			}
		</style>
	`);
}

function updateOpenDialogCount(open) {
	let openDialogs = parseFloat(document.body.dataset.dialogOpenCount) || 0;
	openDialogs += open ? 1 : -1;

	if (openDialogs === 0) {
		delete document.body.dataset.dialogOpenCount;
	} else {
		document.body.dataset.dialogOpenCount = openDialogs;
	}
}

export default class Dialog extends AutoMover {
	static get destination() {
		return document.body;
	}

	static get observedAttributes() {
		return ['hidden'];
	}

	set hidden(hidden) {
		this[hidden ? 'setAttribute' : 'removeAttribute']('hidden', '');
	}

	get hidden() {
		return this.hasAttribute('hidden');
	}

	constructor() {
		super(...arguments);
		this._dismiss = this.dismiss.bind(this);

		if (!document.getElementById(BODY_STYLE_ID)) {
			injectBodyCss();
		}

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>${style}</style>
			${template}
		`;
		this._underlay = this.shadowRoot.getElementById('underlay');

		this._didShow = false;
	}

	connectedCallback() {
		super.connectedCallback(...arguments);

		if (!this.isConnected || this.isAutoMoving) {
			return;
		}

		if (!this.hidden) {
			this._show();
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback(...arguments);

		if (!this.hidden) {
			this._hide();
		}
	}

	attributeChangedCallback(name) {
		if (this.isConnected) {
			if (name === 'hidden') {
				this[this.hidden ? '_hide' : '_show']();
			}
		}
	}

	_show() {
		this._underlay.addEventListener('click', this._dismiss);

		updateScrollbarWidth();
		updateOpenDialogCount(true);

		document.dispatchEvent(new CustomEvent('dialog-connect', { bubbles: true }));
		this._didShow = true;
	}

	_hide() {
		if (!this._didShow) {
			return;
		}

		this._underlay.removeEventListener('click', this._dismiss);

		updateOpenDialogCount(false);

		document.dispatchEvent(new CustomEvent('dialog-disconnect', { bubbles: true }));
	}

	dismiss() {
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
	}
}

customElements.define('bc-dialog', Dialog);
