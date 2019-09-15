import { LitElement, html } from 'lit-element';

const BODY_STYLE_ID = 'dont-scroll-with-open-dialogs';

class Dialog extends LitElement {
	firstUpdated() {
		super.firstUpdated(...arguments);

		if (this.parentElement !== document.body) {
			throw new Error('A bc-dialog must be a direct child of the document body.');
		}

		if (!document.getElementById(BODY_STYLE_ID)) {
			this.injectBodyCss();
		}

		this.setOpenDialogs(true);
	}

	injectBodyCss() {
		const scrollParent = document.createElement('div');
		const scrollChild = document.createElement('div');
		scrollParent.style.overflow = 'scroll';
		scrollParent.append(scrollChild);
		document.body.append(scrollParent);

		const scrollbarWidth = scrollParent.offsetWidth - scrollChild.offsetWidth;
		scrollParent.remove();

		document.body.insertAdjacentHTML('beforeEnd', `
			<style id="${BODY_STYLE_ID}">
				body[data-open-dialogs] {
					overflow: hidden;
					padding-right: ${scrollbarWidth}px;
				}
			</style>
			`
		);
	}

	setOpenDialogs(open) {
		let openDialogs = parseFloat(document.body.dataset.openDialogs) || 0;
		openDialogs += open ? 1 : -1;

		if (openDialogs === 0) {
			delete document.body.dataset.openDialogs;
		} else {
			document.body.dataset.openDialogs = openDialogs;
		}

		Array.from(document.body.children).forEach(async element => {
			if (element !== this) {
				element.inert = openDialogs > 0;
			}
		});
	}

	updated() {
		super.updated(...arguments);
	}

	disconnectedCallback() {
		super.disconnectedCallback(...arguments);
		this.setOpenDialogs(false);
	}

	dismiss() {
		this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
	}

	render() {
		return html`
			<style>
				#underlay {
					background: var(--dialog-background, #8886);
					bottom: 0;
					left: 0;
					position: fixed;
					right: 0;
					top: 0;
					z-index: 2;
				}

				#content {
					align-items: center;
					bottom: 0;
					display: flex;
					justify-content: center;
					left: 0;
					overflow: auto;
					pointer-events: none;
					position: fixed;
					right: 0;
					top: 0;
					z-index: 3;
				}

				#content > ::slotted(*) {
					pointer-events: auto;
				}
			</style>

			<div
				id="underlay"
				@click="${() => this.dismiss()}"
			></div>

			<div id="content">
					<slot></slot>
			</div>
		`;
	}
}

customElements.define('bc-dialog', Dialog);
