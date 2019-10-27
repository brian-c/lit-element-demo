let connectedDialogs = 0;

export default class DialogSafeArea extends HTMLElement {
	constructor() {
		super(...arguments);
		this._handleDialogShow = this._handleDialogChange.bind(this, +1);
		this._handleDialogHide = this._handleDialogChange.bind(this, -1);
	}

	connectedCallback() {
		if (!this.isConnected) {
			return;
		}

		document.addEventListener('dialog-show', this._handleDialogShow);
		document.addEventListener('dialog-hide', this._handleDialogHide);
	}

	disconnectedCallback() {
		document.removeEventListener('dialog-show', this._handleDialogShow);
		document.removeEventListener('dialog-hide', this._handleDialogHide);
	}

	_handleDialogChange(d) {
		connectedDialogs += d;
		this.inert = connectedDialogs !== 0;
	}
}

customElements.define('bc-dialog-safe-area', DialogSafeArea);
