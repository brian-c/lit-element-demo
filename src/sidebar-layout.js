import { LitElement, html, css } from 'lit-element';
import SwipeObserver from './helpers/swipe-observer';

export default class SidebarLayout extends LitElement {
	static get properties() {
		return {
			open: { type: Boolean, reflect: true },
			overlapping: { type: Boolean, reflect: true },
			swiping: { type: Boolean, reflect: true },
		};
	}

	constructor() {
		super(...arguments);
		this.handleResize = this.handleResize.bind(this);
		this.handleSidebarSwipe = this.handleSidebarSwipe.bind(this);

		this.open = false;
	}

	firstUpdated() {
		super.firstUpdated(...arguments);
		this.widthComparator = this.shadowRoot.querySelector('.width-comparator');
		this.sidebar = this.shadowRoot.querySelector('.sidebar');
		this.content = this.shadowRoot.querySelector('.content');

		this.sidebarSwipeObserver = new SwipeObserver(this.sidebar, this.handleSidebarSwipe);
		window.addEventListener('resize', this.handleResize);

		this.handleResize();
	}

  updated(changedProperties) {
		super.updated(...arguments);
		if (changedProperties.has('open')) {
			this.dispatchEvent(new CustomEvent('toggle'));
		}
  }

	disconnectedCallback() {
		super.disconnectedCallback(...arguments);
		this.sidebarSwipeObserver.destroy();
		window.removeEventListener('resize', this.handleResize);
	}

	handleResize() {
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(() => {
			this.overlapping = this.widthComparator.offsetWidth < this.sidebar.offsetWidth;
			this.style.setProperty('--sidebar-actual-width', `${this.sidebar.offsetWidth}px`);
		}, 50);
	}

	handleSidebarSwipe({dx, done}, event) {
		const swipeAmount = Math.max(0, dx) / this.sidebar.offsetWidth;

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

	render() {
		return html`
			<style>
				:host {
					--sidebar-max-width: 33%;
					--sidebar-overlapped-max-width: 85%;
					--sidebar-swipe-threshold: 0.5;
					--sidebar-transition-duration: 0.5s;
				}

				:host([swiping]) {
					--sidebar-swipe-progress-opacity: calc(
						(1 - var(--sidebar-swipe-progress, 0))
						* (1 / (1 - var(--sidebar-swipe-threshold)))
					);
				}

				.width-comparator {
					height: 1px;
					opacity: 0;
					pointer-events: none;
					position: absolute;
					width: var(--sidebar-max-width);
				}

				.sidebar {
					bottom: 0;
					display: flex;
					left: 0;
					max-width: var(--sidebar-overlapped-max-width);
					-webkit-overflow-scrolling: touch;
					position: fixed;
					top: 0;
					transform: translateX(-100%);
					transition:
						opacity var(--sidebar-transition-duration), /* Hide the jump when releasing a swipe */
						transform var(--sidebar-transition-duration);
					z-index: 2;
				}

				.sidebar > ::slotted(*) {
					overflow: auto;
				}

				:host([overlapping]) > .sidebar {
					max-width: var(--sidebar-overlapped-max-width);
				}
				:host([open]) > .sidebar {
					transform: translateX(calc(-100% * var(--sidebar-swipe-progress, 0)));
					opacity: var(--sidebar-swipe-progress-opacity);
				}

				:host([swiping]) > .sidebar {
					transition: none;
				}

				.underlay {
					background: var(--sidebar-underlay-background, #8883);
					bottom: 0;
					left: 0;
					opacity: 0;
					position: fixed;
					right: 0;
					top: 0;
					transform: translateX(-100%);
					transition: /* Fade out, delay before snapping offscreen */
						opacity var(--sidebar-transition-duration),
						transform 0s linear var(--sidebar-transition-duration);
					z-index: 1;
				}

				:host([open]) > .underlay {
					opacity: var(--sidebar-swipe-progress-opacity);
					transform: translateX(0);
					transition: /* Snap into place while fading in */
						opacity var(--sidebar-transition-duration),
						transform 0.01ms;
				}

				:host([swiping]) > .underlay {
					transition: none;
				}

				.content {
					transition: margin-left var(--sidebar-transition-duration);
				}
				:host([open]:not([overlapping])) > .content {
					margin-left: calc(var(--sidebar-actual-width) * (1 - var(--sidebar-swipe-progress, 0)));
				}

				:host([swiping]) > .content {
					transition: none;
				}
			</style>
			<div class="width-comparator"></div>

			<div
				class="sidebar"
				?inert="${!this.open}"
			>
				<slot name="sidebar"></slot>
			</div>

			${this.overlapping ? (html`
				<div
					class="underlay"
					@click="${() => this.open = false}"
				></div>
			`) : (
				null
			)}

			<div
				class="content"
				?inert="${this.open && this.overlapping}"
			>
				<slot></slot>
			</div>
		`;
	}
}

customElements.define('bc-sidebar-layout', SidebarLayout);
