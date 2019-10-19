import Breadcrumb from './breadcrumb';

export default class AutoMover extends HTMLElement {
	static get destination() {
		throw new Error('You must specify the destination for an AutoMover.');
	}

	constructor() {
		super(...arguments);
		this._breadcrumb = new Breadcrumb();
		this._breadcrumb.target = this;
		this.isAutoMoving = false;
	}

	connectedCallback() {
		if (!this.isConnected) {
			return;
		}

		if (this.isAutoMoving) {
			return;
		}

		this.move();
	}

	disconnectedCallback() {
		if (this.isAutoMoving) {
			return;
		}

		this._breadcrumb.remove();
	}

	move() {
		try {
			this.isAutoMoving = true;
			this.parentElement.insertBefore(this._breadcrumb, this);
			this.constructor.destination.append(this);
		} catch (error) {} finally {
			this.isAutoMoving = false;
		}
	}
}
