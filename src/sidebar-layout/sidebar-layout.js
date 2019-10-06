import SwipeObserver from '../helpers/swipe-observer';
import template from './sidebar-layout.html';
import style from './sidebar-layout.css';

const RESIZE_DEBOUNCE = 15;

class SidebarLayout extends HTMLElement {
	static get observedAttributes() {
		return ['open', 'overlapping', 'swiping'];
	}

	set open(value) {
		this[value ? 'setAttribute' : 'removeAttribute']('open', '');
	}

	get open() {
		return this.hasAttribute('open');
	}

	set overlapping(value) {
		this[value ? 'setAttribute' : 'removeAttribute']('overlapping', '');
	}

	get overlapping() {
		return this.hasAttribute('overlapping');
	}

	set swiping(value) {
		this[value ? 'setAttribute' : 'removeAttribute']('swiping', '');
	}

	get swiping() {
		return this.hasAttribute('swiping');
	}

	constructor() {
		super(...arguments);
		this._handleResize = this._handleResize.bind(this);
		this._handleSwipe = this._handleSwipe.bind(this);
		this._toggle = this.toggle.bind(this);

		this._resizeTimeout = NaN;

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>${style}</style>
			${template}
		`;
		this._widthComparator = this.shadowRoot.getElementById('width-comparator');
		this._underlay = this.shadowRoot.getElementById('underlay');
		this._sidebar = this.shadowRoot.getElementById('sidebar');
		this._content = this.shadowRoot.getElementById('content');
	}

	connectedCallback() {
		if (!this.isConnected) {
			return;
		}

		addEventListener('resize', this._handleResize);
		this._swipeObserver = new SwipeObserver(this._sidebar, this._handleSwipe);
		this._underlay.addEventListener('click', this._toggle);

		this._handleResize();
	}

	disconnectedCallback() {
		removeEventListener('resize', this._handleResize);
		this._swipeObserver.destroy();
		this._underlay.removeEventListener('click', this._toggle);
	}

	attributeChangedCallback(name) {
		if (name === 'open' || name === 'overlapping') {
			this._content.inert = this.open && this.overlapping;
		}

		if (name === 'open') {
			this._handleResize();
			this._sidebar.inert = !this.open;
			this.dispatchEvent(new CustomEvent('toggle', { bubbles: true }));
		}

		if (name === 'overlapping') {
			this._underlay.style.display = this.overlapping ? '' : 'none';
		}
	}

	_handleResize() {
		clearTimeout(this._resizeTimeout);

		this._resizeTimeout = setTimeout(() => {
			this.overlapping = this._widthComparator.offsetWidth < this._sidebar.offsetWidth;
			this.style.setProperty('--sidebar-actual-width', `${this._sidebar.offsetWidth}px`);
		}, RESIZE_DEBOUNCE);
	}

	_handleSwipe({dx, done}, event) {
		const swipeAmount = Math.max(0, dx) / this._sidebar.offsetWidth;

		if (!done) {
			this.swiping = true;
			this.style.setProperty('--sidebar-swipe-progress', swipeAmount);
			event.preventDefault();
		} else {
			const computedStyle = getComputedStyle(this);
			const thresholdValue = computedStyle.getPropertyValue('--sidebar-swipe-threshold');
			const swipeThreshold = parseFloat(thresholdValue);

			if (swipeAmount > swipeThreshold) {
				this.open = false;
			}

			this.swiping = false;
			this.style.removeProperty('--sidebar-swipe-progress');
		}
	}

	toggle() {
		this.open = !this.open;
	}
}

customElements.define('bc-sidebar-layout', SidebarLayout);
