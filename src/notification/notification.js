import AutoMover from "../helpers/auto-mover";
import template from './notification.html';
import style from './notification.css';

export default class Notification extends AutoMover {
	static get destination() {
		return document.querySelector('bc-notification-host');
	}

	constructor() {
		super(...arguments);

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>${style}</style>
			${template}
		`;
	}

	connectedCallback() {
		super.connectedCallback(...arguments);

		if (!this.isConnected) {
			return;
		}
	}
}

customElements.define('bc-notification', Notification);
