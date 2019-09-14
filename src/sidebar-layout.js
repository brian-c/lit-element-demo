import '@webcomponents/webcomponentsjs';
import { LitElement, html, css } from 'lit-element';

class SidebarLayout extends LitElement {
	static get styles() {
		return css`
			:host {
				--sidebar-max-width: 33%;
				--sidebar-overlapping-width: 85%;
				--sidebar-transition: 0.3s;
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
				max-width: var(--sidebar-overlapping--width);
				-webkit-overflow-scrolling: touch;
				position: fixed;
				top: 0;
				transform: translateX(-100%);
				transition: transform var(--sidebar-transition);
				z-index: 1;
			}

			.sidebar > ::slotted(*) {
				overflow: auto;
			}

			:host([overlapping]) > .sidebar {
				max-width: var(--sidebar-overlapping--width);
			}

			:host([open]) > .sidebar {
				transform: translateX(calc(-100% * var(--sidebar-swiping-closed, 0)));
			}

			:host([swiping-closed]) > .sidebar {
				transition: none;
			}

			.underlay {
				background: linear-gradient(90deg, #0003, #0000);
				bottom: 0;
				left: 0;
				position: fixed;
				right: 0;
				top: 0;
				transform: translateX(-100%);
				transition: transform var(--sidebar-transition);
			}

			:host([open]) > .underlay {
				transform: translateX(calc(-100% * var(--sidebar-swiping-closed, 0)));
			}

			:host([swiping-closed]) > .underlay {
				transition: none;
			}

			.content {
				transition: margin-left var(--sidebar-transition);
			}

			:host([open]:not([overlapping])) > .content {
				margin-left: calc(var(--sidebar-actual-width) * (1 - var(--sidebar-swiping-closed, 0)));
			}

			:host([swiping-closed]) > .content {
				transition: none;
			}
		`;
	}

	static get properties() {
		return {
			open: { type: Boolean, reflect: true },
			overlapping: { type: Boolean, reflect: true },
			swipeTouch: { type: Object, reflect: true, attribute: 'swiping-closed' },
		};
	}

	constructor() {
		super(...arguments);
		this.handleResize = this.handleResize.bind(this);
		this.handleSidebarTouchMove = this.handleSidebarTouchMove.bind(this);
		this.handleSidebarTouchEnd = this.handleSidebarTouchEnd.bind(this);

		this.open = false;
	}

	firstUpdated() {
		super.firstUpdated(...arguments);

		this.widthComparator = this.shadowRoot.querySelector('.width-comparator');
		this.sidebar = this.shadowRoot.querySelector('.sidebar');

		addEventListener('resize', this.handleResize);
		this.handleResize();
	}

	disconnectedCallback() {
		super.disconnectedCallback(...arguments);
		removeEventListener('resize', this.handleResize);
	}

	handleResize() {
		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(() => {
			this.overlapping = this.widthComparator.offsetWidth < this.sidebar.offsetWidth;
			this.style.setProperty('--sidebar-actual-width', `${this.sidebar.offsetWidth}px`);
		}, 50);
	}

	handleSidebarTouchStart(event) {
		if (event.touches.length !== 1) { return; }
		this.swipeTouch = event.touches[0];
		this.addEventListener('touchmove', this.handleSidebarTouchMove);
		this.addEventListener('touchend', this.handleSidebarTouchEnd);
	}

	handleSidebarTouchMove(event) {
		const touches = [...event.changedTouches];
		const movedTouch = touches.find(t => t.identifier === this.swipeTouch.identifier);
		if (!movedTouch) { return; }

		const swipeDistance = this.swipeTouch.pageX - movedTouch.pageX;
		const swipeAmount = Math.max(0, swipeDistance) / this.sidebar.offsetWidth;
		this.style.setProperty('--sidebar-swiping-closed', swipeAmount);
	}

	handleSidebarTouchEnd(event) {
		const touches = [...event.changedTouches];
		const endedTouch = touches.find(t => t.identifier === this.swipeTouch.identifier);
		if (!endedTouch) { return; }

		this.removeEventListener('touchmove', this.handleSidebarTouchMove);
		this.removeEventListener('touchend', this.handleSidebarTouchEnd);

		const swipeDistance = this.swipeTouch.pageX - endedTouch.pageX;
		if (swipeDistance / this.sidebar.offsetWidth > 2/3) {
			this.open = false;
		}

		this.swipeTouch = null;
		this.style.removeProperty('--sidebar-swiping-closed');
	}

	toggle() {
		this.open = !this.open;
	}

	render() {
		return html`
			<div class="width-comparator"></div>

			<div
				class="sidebar"
				@touchstart="${this.handleSidebarTouchStart}"
			>
				<slot name="sidebar"></slot>
			</div>

			${this.overlapping ? html`
				<div
					class="underlay"
					@click="${this.toggle}"
				></div>
			` : null}

			<div class="content">
				<slot></slot>
			</div>
		`;
	}
}

customElements.define('bc-sidebar-layout', SidebarLayout);
