import Breadcrumb from './breadcrumb';

const DESTINATION = Symbol('DESTINATION');
const BREADCRUMB =Symbol('BREADCRUMB');
const IS_MOVING = Symbol('IS_MOVING');
const MOVE = Symbol('MOVE');

export function reparent(Class, moveIntoPlace) {
	return class extends Class {
		constructor() {
			super(...arguments);
			this[BREADCRUMB] = new Breadcrumb();
			this[BREADCRUMB].target = this;
			this[IS_MOVING] = false;
		}

		connectedCallback() {
			if (!this[IS_MOVING]) {
				if (this.isConnected) {
					this[MOVE]();
				}
				super.connectedCallback && super.connectedCallback(...arguments);
			}
		}

		disconnectedCallback() {
			if (!this[IS_MOVING]) {
				super.disconnectedCallback && super.disconnectedCallback(...arguments);
				this[BREADCRUMB].remove();
			}
		}

		[MOVE]() {
			try {
				this[IS_MOVING] = true;
				this.parentElement.insertBefore(this[BREADCRUMB], this);
				moveIntoPlace(this);
			} catch (error) {
				throw error;
			} finally {
				this[IS_MOVING] = false;
			}
		}
	};
}
