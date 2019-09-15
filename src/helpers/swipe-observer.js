export default class SwipeObserver {
	constructor(element, changeHandler) {
		this.element = element;
		this.changeHandler = changeHandler;
		this.swipeTouch = null;

		this.element.addEventListener('touchstart', this);
	}

	handleEvent(event) {
		const handler = this[`${event.type}Handler`];

		if (handler !== undefined) {
			handler.apply(this, arguments);
		}
	}

	touchstartHandler(event) {
		if (event.touches.length === 1) {
			this.swipeTouch = event.touches[0];
			window.addEventListener('touchmove', this);
			window.addEventListener('touchend', this);
		}
	}

	touchmoveHandler(event) {
		const touches = [...event.changedTouches];
		const movedTouch = touches.find(t => t.identifier === this.swipeTouch.identifier);

		if (movedTouch) {
			this.callChangeHandler(event, movedTouch, false);
		}
	}

	touchendHandler(event) {
		const touches = [...event.changedTouches];
		const endedTouch = touches.find(t => t.identifier === this.swipeTouch.identifier);

		if (endedTouch) {
			try {
				this.callChangeHandler(event, endedTouch, true);
			} finally {
				window.removeEventListener('touchmove', this);
				window.removeEventListener('touchend', this);
				this.swipeTouch = null;
			}
		}
	}

	callChangeHandler(event, touch, done) {
		this.changeHandler({
			dx: this.swipeTouch.pageX - touch.pageX,
			dy: this.swipeTouch.pageY - touch.pageY,
			done
		}, event);
	}

	destroy() {
		this.element.removeEventListener('touchstart', this);
	}
}
