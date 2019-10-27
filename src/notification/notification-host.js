import AutoMover from "../helpers/auto-mover";
import template from './notification-host.html';
import style from './notification-host.css';
import waitForTransitions from '../helpers/wait-for-transitions';

export default class NotificationHost extends AutoMover {
	static get destination() {
		return document.body;
	}

	constructor() {
		super(...arguments);

		this._updateWidth = this._updateWidth.bind(this);

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>${style}</style>
			${template}
		`;

		this._container = this.shadowRoot.getElementById('container');
	}

	connectedCallback() {
		super.connectedCallback(...arguments);

		if (!this.isConnected) {
			return;
		}

		if (this.isAutoMoving) {
			return;
		}

		this.setAttribute('aria-live', true);

		// Collect any notifications that've connected before the host.
		const notifications = document.querySelectorAll('bc-notification')
		notifications.forEach(notification => notification.move());

		this.addEventListener('resize', this._updateWidth);

		this.addEventListener('notification-show', this._updateWidth);
		this.addEventListener('notification-will-hide', this._updateWidth);
	}

	disconnectedCallback() {
		super.connectedCallback(...arguments);

		if (this.isAutoMoving) {
			return;
		}

		this.removeEventListener('resize', this._updateWidth);

		this.removeEventListener('notification-show', this._updateWidth);
		this.removeEventListener('notification-will-hide', this._updateWidth);
	}

	_getWidthWithoutOutgoingNotifications() {
		const originalWidth = this._container.style.width;

		this._container.style.width = '';

		const outgoingNotifications = this.querySelectorAll('[style*="--notification-height"]');

		outgoingNotifications.forEach(notification => {
			notification.style.display = 'none';
		});

		const eventualWidth = this._container.getBoundingClientRect().width;

		this._container.style.width = originalWidth;

		outgoingNotifications.forEach(notification => {
			notification.style.display = '';
		});

		return eventualWidth;
	}

	_updateWidth() {
		const newWidth = this._getWidthWithoutOutgoingNotifications();
		setTimeout(() => {
			this._container.style.width = `${newWidth}px`;
		});
	}
}

customElements.define('bc-notification-host', NotificationHost);
