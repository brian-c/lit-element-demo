import openDialogBodyStyle from './open-dialog-body.css';

const BODY_STYLE_ID = 'dialog-body-styles';

export function injectBodyCss() {
	if (!document.getElementById(BODY_STYLE_ID)) {
		document.head.insertAdjacentHTML('afterBegin', `
			<style id="${BODY_STYLE_ID}">
				${openDialogBodyStyle}
			</style>
		`);
	}
}

export function updateScrollbarWidth() {
	const scrollParent = document.createElement('div');
	const scrollChild = document.createElement('div');
	scrollParent.style.overflow = 'scroll';
	scrollParent.append(scrollChild);
	document.body.append(scrollParent);
	const scrollbarWidth = scrollParent.offsetWidth - scrollChild.offsetWidth;
	scrollParent.remove();
	document.documentElement.style.setProperty('--dialog-scrollbar-width', `${scrollbarWidth}px`)
}

export function updateOpenDialogCount(open) {
	let openDialogs = parseFloat(document.body.dataset.dialogOpenCount) || 0;
	openDialogs += open ? 1 : -1;

	if (openDialogs === 0) {
		delete document.body.dataset.dialogOpenCount;
	} else {
		document.body.dataset.dialogOpenCount = openDialogs;
	}
}
