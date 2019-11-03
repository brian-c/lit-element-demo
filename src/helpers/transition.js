import waitForTransitions from './wait-for-transitions';

const TRANSITIONING = Symbol('TRANSITIONING');

export const BEFORE_SHOW = Symbol('BEFORE_SHOW');
export const SHOW = Symbol('SHOW');
export const AFTER_SHOW = Symbol('AFTER_SHOW');

export const BEFORE_HIDE = Symbol('BEFORE_HIDE');
export const HIDE = Symbol('HIDE');
export const AFTER_HIDE = Symbol('AFTER_HIDE');

export function mixInTransitions(Class) {
	return class extends Class {
		static get observedAttributes() {
			const originalValue = Class.observedAttributes || [];
			return [...originalValue, 'hidden'];
		}

		set hidden(hidden) {
			this[hidden ? 'setAttribute' : 'removeAttribute']('hidden', '');
		}

		get hidden() {
			return this.hasAttribute('hidden');
		}

		set [TRANSITIONING](transitioning) {
			const method = transitioning ? 'setAttribute' : 'removeAttribute';
			this[method]('transitioning', transitioning);
		}

		get [TRANSITIONING]() {
			return this.getAttribute('transitioning');
		}

		connectedCallback() {
			if (super.connectedCallback) {
				super.connectedCallback(...arguments);
			}

			if (this.isConnected && !this.hidden) {
				// Prevent animating from non-transitioning state
				this[TRANSITIONING] = 'in';
				this[SHOW]();
			}
		}

		disconnectedCallback() {
			if (this.isConnected && !this.hidden) {
				this[HIDE]().then(() => {
					if (super.disconnectedCallback) {
						super.disconnectedCallback(...arguments);
					}
				});
			}
		}

		attributeChangedCallback(name) {
			if (this.isConnected) {
				if (name === 'hidden') {
					if (!this.hidden) {
						this[TRANSITIONING] = 'in';
					}

					this[this.hidden ? HIDE : SHOW]();
				}
			}

			if (super.attributeChangedCallback) {
				super.attributeChangedCallback(...arguments);
			}
		}

		[BEFORE_SHOW]() {
			if (super[BEFORE_SHOW]) {
				return super[BEFORE_SHOW](...arguments);
			}
		}

		[AFTER_SHOW]() {
			this[TRANSITIONING] = null;

			if (super[AFTER_SHOW]) {
				return super[AFTER_SHOW](...arguments);
			}
		}

		[SHOW]() {
			this[BEFORE_SHOW]();
			return waitForTransitions(this, () => {
				this[TRANSITIONING] = 'in';

				if (super[SHOW]) {
					super[SHOW]();
				}
			}).then(() => {
				return this[AFTER_SHOW]();
			});
		}

		[BEFORE_HIDE]() {
			this.style.display = 'block';

			if (super[BEFORE_HIDE]) {
				return super[BEFORE_HIDE](...arguments);
			}
		}

		[AFTER_HIDE]() {
			this.style.display = '';
			this[TRANSITIONING] = null;

			if (super[AFTER_HIDE]) {
				return super[AFTER_HIDE](...arguments);
			}
		}

		[HIDE]() {
			this[BEFORE_HIDE]();
			return new Promise(resolve => {
				setTimeout(() => {
					return waitForTransitions(this, () => {
						this[TRANSITIONING] = 'out';

						if (super[HIDE]) {
							return super[HIDE]();
						}
					}).then(() => {
						return Promise.resolve(this[AFTER_HIDE]()).then(resolve);
					});
				});
			});
		}

		remove() {
			const superRemove = super.remove.bind(this, ...arguments);
			return this[HIDE]().then(superRemove);
		}
	}
}
