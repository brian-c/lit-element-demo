let connectedDialogs = 0;

export default class DialogSafeArea extends HTMLElement {
	constructor() {
		super(...arguments);
		this._handleDialogConnect = this._handleDialogChange.bind(this, +1);
		this._handleDialogDisconnect = this._handleDialogChange.bind(this, -1);
	}

	connectedCallback() {
		if (!this.isConnected) {
			return;
		}

		addEventListener('dialog-connect', this._handleDialogConnect);
		addEventListener('dialog-disconnect', this._handleDialogDisconnect);
	}

	disconnectedCallback() {
		removeEventListener('dialog-connect', this._handleDialogConnect);
		removeEventListener('dialog-disconnect', this._handleDialogDisconnect);
	}

	_handleDialogChange(d) {
		connectedDialogs += d;
		this.inert = connectedDialogs !== 0;
	}
}

customElements.define('bc-dialog-safe-area', DialogSafeArea);
