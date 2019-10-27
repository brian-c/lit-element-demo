export default class Breadcrumb extends HTMLElement {
	constructor() {
		super(...arguments);

		this.target = null;

		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: none;
				}
			</style>
		`;
	}

	disconnectedCallback() {
		if (this.target.isConnected) {
			this.target.remove();
		}
	}
}

customElements.define('bc-breadcrumb', Breadcrumb);
