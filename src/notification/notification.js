import AutoMover from "../helpers/auto-mover";
import template from './notification.html';
import style from './notification.css';
import waitForTransitions from '../helpers/wait-for-transitions';
import { promised } from "q";

export default class Notification extends AutoMover {
	static get destination() {
		return document.querySelector('bc-notification-host');
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

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>${style}</style>
			${template}
		`;

		this._container = this.shadowRoot.getElementById('container');
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
		if (!this.isConnected || this.isAutoMoving) {
			return Promise.resolve();
		}

		return waitForTransitions(this, () => {
			this.transitioning = 'in';
			this.dispatchEvent(new CustomEvent('notification-show', { bubbles: true }));
		}).then(() => {
			this.transitioning = null;
		});
	}

	_hide() {
		if (!this.isConnected || this.isAutoMoving) {
			return Promise.resolve();
		}

		const { width, height } = this._container.getBoundingClientRect();
		this.style.setProperty('--notification-height', `${height}px`);
		this._container.style.width = `${width}px`;

		this.dispatchEvent(new CustomEvent('notification-will-hide', { bubbles: true }));

		return new Promise(resolve => {
			setTimeout(() => {
				return waitForTransitions(this, () => {
					this.transitioning = 'out';
				}).then(() => {
					this.transitioning = null;
					this.dispatchEvent(new CustomEvent('notification-hide', { bubbles: true }));
					resolve();
				});
			});
		});
	}

	remove() {
		const superRemove = super.remove.bind(this, ...arguments);
		return this._hide().then(superRemove);
	}
}

customElements.define('bc-notification', Notification);
