import AutoMover from "../helpers/auto-mover";
import template from './notification-host.html';
import style from './notification-host.css';

export default class NotificationHost extends AutoMover {
	static get destination() {
		return document.body;
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

		this.setAttribute('aria-live', true);

		const notifications = document.querySelectorAll('bc-notification')
		notifications.forEach(notification => notification.move());
	}
}

customElements.define('bc-notification-host', NotificationHost);
