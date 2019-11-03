import { mixInTransitions, BEFORE_SHOW, BEFORE_HIDE, AFTER_HIDE } from '../helpers/transition';
import { reparent } from '../helpers/reparent';
import template from './notification.html';
import style from './notification.css';

class Notification extends HTMLElement {
	constructor() {
		super(...arguments);

		this.attachShadow({ mode: 'open' });

		this.shadowRoot.innerHTML = `
			<style>${style}</style>
			${template}
		`;

		this._container = this.shadowRoot.getElementById('container');
	}

	[BEFORE_SHOW]() {
		this.dispatchEvent(new CustomEvent('notification-show', { bubbles: true }));
	}

	[BEFORE_HIDE]() {
		const { width, height } = this._container.getBoundingClientRect();
		this.style.setProperty('--notification-height', `${height}px`);
		this._container.style.width = `${width}px`;

		this.dispatchEvent(new CustomEvent('notification-will-hide', { bubbles: true }));
	}

	[AFTER_HIDE]() {
		this.dispatchEvent(new CustomEvent('notification-hide', { bubbles: true }));
	}
}

const EnhancedNotification = reparent(mixInTransitions(Notification), function(notification) {
	const notificationHost = notification.ownerDocument.querySelector('bc-notification-host');
	notificationHost.append(notification);
});

customElements.define('bc-notification', EnhancedNotification);

export default EnhancedNotification;
