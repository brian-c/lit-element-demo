export default function waitForTransitions(element, setup, delay = 50) {
	return new Promise(resolve => {
		const targets = [element, element.shadowRoot];

		let transitions = [];

		function handleTransitionRun(event) {
			transitions.push(event.propertyName);
		}

		function handleTransitionEnd(event) {
			const index = transitions.indexOf(event.propertyName);

			if (index !== -1) {
				transitions.splice(index, 1);
			}

			if (transitions.length === 0) {
				targets.forEach(target => {
					target.removeEventListener('transitionrun', handleTransitionRun);
					target.removeEventListener('transitionend', handleTransitionEnd);
				});

				resolve();
			}
		}

		targets.forEach(target => {
			target.addEventListener('transitionrun', handleTransitionRun);
			target.addEventListener('transitionend', handleTransitionEnd);
		});

		setup();

		setTimeout(() => {
			if (transitions.length === 0) {
				resolve();
			}
		}, delay);
	});
}
