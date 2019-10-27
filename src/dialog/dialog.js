import AutoMover from '../helpers/auto-mover';
import template from './dialog.html';
import style from './dialog.css';
import openDialogBodyStyle from './open-dialog-body.css';
import waitForTransitions from '../helpers/wait-for-transitions';

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
	document.head.insertAdjacentHTML('afterBegin', `
		<style id="${BODY_STYLE_ID}">
			${openDialogBodyStyle}
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
		return ['hidden', 'transitioning'];
	}

	set hidden(hidden) {
		this[hidden ? 'setAttribute' : 'removeAttribute']('hidden', '');
	}

	get hidden() {
		return this.hasAttribute('hidden');
	}

	set transitioning(transitioning) {
		this[transitioning ? 'setAttribute' : 'removeAttribute']('transitioning', transitioning);
	}

	get transitioning() {
		return this.getAttribute('transitioning');
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

		this._isShowing = false;
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

		if (this.isAutoMoving) {
			return;
		}

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
		if (this.isAutoMoving || this._isShowing) {
			return Promise.resolve();
		}

		return waitForTransitions(this, () => {
			this._isShowing = true;
			this.transitioning = 'in';
			this._underlay.addEventListener('click', this._dismiss);
			updateScrollbarWidth();
			updateOpenDialogCount(true);
			document.dispatchEvent(new CustomEvent('dialog-show', { bubbles: true }));
		}).then(() => {
			this.transitioning = null;
		});
	}

	_hide() {
		if (this.isAutoMoving || !this._isShowing) {
			return Promise.resolve();
		}

		return waitForTransitions(this, () => {
			this.transitioning = 'out';
			this._underlay.removeEventListener('click', this._dismiss);
		}).then(() => {
			updateOpenDialogCount(false);
			this.transitioning = null;
			document.dispatchEvent(new CustomEvent('dialog-hide', { bubbles: true }));
			this._isShowing = false;
		});
	}

	dismiss() {
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
	}

	remove() {
		const superRemove = super.remove.bind(this, ...arguments);
		return this._hide().then(superRemove);
	}
}

customElements.define('bc-dialog', Dialog);
