import template from './dialog.html';

const BODY_STYLE_ID = 'dialog-body';

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
	document.body.insertAdjacentHTML('beforeEnd', `
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

class Dialog extends HTMLElement {
	constructor() {
		super(...arguments);
		this._dismiss = this.dismiss.bind(this);

		if (!document.getElementById(BODY_STYLE_ID)) {
			injectBodyCss();
		}

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = template;
		this._underlay = this.shadowRoot.getElementById('underlay');
	}

	connectedCallback() {
		if (!this.isConnected) {
			return;
		}

		if (this.parentElement !== document.body) {
			console.warn('A Dialog should be a direct child of the document body.');
		}

		updateScrollbarWidth();

		this._underlay.addEventListener('click', this._dismiss);
		updateOpenDialogCount(true);
		dispatchEvent(new CustomEvent('dialog-connect', { bubbles: true }));
	}

	disconnectedCallback() {
		this._underlay.removeEventListener('click', this._dismiss);
		updateOpenDialogCount(false);
		dispatchEvent(new CustomEvent('dialog-disconnect', { bubbles: true }));
	}

	dismiss() {
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
	}
}

customElements.define('bc-dialog', Dialog);
