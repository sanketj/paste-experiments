const DRAG_ANCHOR = {
    NONE: 0,
    TOP_LEFT: 1,
    LEFT: 2,
    BOTTOM_LEFT: 3,
    BOTTOM: 4,
    BOTTOM_RIGHT: 5,
    RIGHT: 6,
    TOP_RIGHT: 7,
    TOP: 8,
}

class PasteToolbar extends HTMLElement {
    constructor() {
        super();

        this.addEventListener('mouseenter', () => this.classList.remove('hidden'));
        this.addEventListener('mouseleave', () => this.classList.add('hidden'));

        this.cropButton_ = new CropButton('Crop');
        this.resizeButton_ = new ResizeButton('Resize');
        this.classList.add('hidden');
        this.append(this.cropButton_, this.resizeButton_);
    }
}
window.customElements.define('paste-toolbar', PasteToolbar);

class PasteToolbarButton extends HTMLElement {
    constructor(buttonContents) {
        super();

        this.append(buttonContents);
        this.addEventListener('click', () => {
            document.querySelector('body-overlay').classList.remove('hidden');
            document.querySelector('paste-overlay').classList.remove('hidden');
        });
    }
}
window.customElements.define('paste-toolbar-button', PasteToolbarButton);

class CropButton extends PasteToolbarButton {
    constructor(buttonContents) {
        super(buttonContents);

        this.addEventListener('click', () => document.cropMode = true);
    }
}
window.customElements.define('crop-button', CropButton);

class ResizeButton extends PasteToolbarButton {
    constructor(buttonContents) {
        super(buttonContents);

        this.addEventListener('click', () => document.resizeMode = true);
    }
}
window.customElements.define('resize-button', ResizeButton);

class PasteOverlay extends HTMLElement {
    constructor(left, top, width, height) {
        super();

        this.style.left = left + 'px';
        this.style.top = top + 'px';
        this.style.width = width + 'px';
        this.style.height = height + 'px';
        this.classList.add('hidden');
        this.dragAnchor_ = DRAG_ANCHOR.NONE;
    }

    get dragAnchor() {
        return this.dragAnchor_;
    }

    updateDragAnchor(mousePosX, mousePosY) {
        const TOLERANCE = 5;
        let boundingRect = this.getBoundingClientRect();
        let left = Math.round(boundingRect.left);
        let right = Math.round(boundingRect.right);
        let top = Math.round(boundingRect.top);
        let bottom = Math.round(boundingRect.bottom);
        if (Math.abs(left - mousePosX) <= TOLERANCE && Math.abs(top - mousePosY) <= TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.TOP_LEFT;
        } else if (Math.abs(left - mousePosX) <= TOLERANCE && Math.abs(bottom - mousePosY) <= TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.BOTTOM_LEFT;
        } else if (Math.abs(right - mousePosX) <= TOLERANCE && Math.abs(bottom - mousePosY) <= TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.BOTTOM_RIGHT;
        } else if (Math.abs(right - mousePosX) <= TOLERANCE && Math.abs(top - mousePosY) <= TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.TOP_RIGHT;
        } else if (Math.abs(left - mousePosX) <= TOLERANCE && top - TOLERANCE < mousePosY && mousePosY < bottom + TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.LEFT;
        } else if (left - TOLERANCE < mousePosX && mousePosX < right + TOLERANCE && Math.abs(bottom - mousePosY) <= TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.BOTTOM;
        } else if (Math.abs(right - mousePosX) <= TOLERANCE && top - TOLERANCE < mousePosY && mousePosY < bottom + TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.RIGHT;
        } else if (left - TOLERANCE < mousePosX && mousePosX < right + TOLERANCE && Math.abs(top - mousePosY) <= TOLERANCE) {
            this.dragAnchor_ = DRAG_ANCHOR.TOP;
        } else {
            this.dragAnchor_ = DRAG_ANCHOR.NONE;
        }
    }

    resetDragAnchor() {
        this.dragAnchor_ = DRAG_ANCHOR.NONE;
    }

    adjustForDrag(mousePosX, mousePosY) {
        switch (this.dragAnchor_) {
            case DRAG_ANCHOR.TOP_LEFT: {
                let xDiff = mousePosX - this.offsetLeft;
                let yDiff = mousePosY - this.offsetTop;
                this.style.width = (this.offsetWidth - xDiff -
                    window.getComputedStyle(this).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(this).paddingRight.replace('px', '') -
                    window.getComputedStyle(this).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderRightWidth.replace('px', '')) + 'px';
                this.style.height = (this.offsetHeight - yDiff -
                    window.getComputedStyle(this).paddingTop.replace('px', '') - 
                    window.getComputedStyle(this).paddingBottom.replace('px', '') -
                    window.getComputedStyle(this).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderBottomWidth.replace('px', '')) + 'px';
                this.style.left = mousePosX + 'px';
                this.style.top = mousePosY + 'px';
                break;
            }
            case DRAG_ANCHOR.BOTTOM_LEFT: {
                let xDiff = mousePosX - this.offsetLeft;
                let yRemainder = mousePosY - this.offsetTop;
                this.style.width = (this.offsetWidth - xDiff -
                    window.getComputedStyle(this).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(this).paddingRight.replace('px', '') -
                    window.getComputedStyle(this).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderRightWidth.replace('px', '')) + 'px';
                this.style.height = (yRemainder -
                    window.getComputedStyle(this).paddingTop.replace('px', '') - 
                    window.getComputedStyle(this).paddingBottom.replace('px', '') -
                    window.getComputedStyle(this).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderBottomWidth.replace('px', '')) + 'px';
                this.style.left = mousePosX + 'px';
                break;
            }
            case DRAG_ANCHOR.BOTTOM_RIGHT: {
                let xRemainder = mousePosX - this.offsetLeft;
                let yRemainder = mousePosY - this.offsetTop;
                this.style.width = (xRemainder -
                    window.getComputedStyle(this).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(this).paddingRight.replace('px', '') -
                    window.getComputedStyle(this).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderRightWidth.replace('px', '')) + 'px';
                this.style.height = (yRemainder -
                    window.getComputedStyle(this).paddingTop.replace('px', '') - 
                    window.getComputedStyle(this).paddingBottom.replace('px', '') -
                    window.getComputedStyle(this).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderBottomWidth.replace('px', '')) + 'px';
                break;
            }
            case DRAG_ANCHOR.TOP_RIGHT: {
                let xRemainder = mousePosX - this.offsetLeft;
                let yDiff = mousePosY - this.offsetTop;
                this.style.width = (xRemainder -
                    window.getComputedStyle(this).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(this).paddingRight.replace('px', '') -
                    window.getComputedStyle(this).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderRightWidth.replace('px', '')) + 'px';
                this.style.height = (this.offsetHeight - yDiff -
                    window.getComputedStyle(this).paddingTop.replace('px', '') - 
                    window.getComputedStyle(this).paddingBottom.replace('px', '') -
                    window.getComputedStyle(this).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderBottomWidth.replace('px', '')) + 'px';
                this.style.top = mousePosY + 'px';
                break;
            }
            case DRAG_ANCHOR.LEFT: {
                let xDiff = mousePosX - this.offsetLeft;
                this.style.width = (this.offsetWidth - xDiff -
                    window.getComputedStyle(this).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(this).paddingRight.replace('px', '') -
                    window.getComputedStyle(this).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderRightWidth.replace('px', '')) + 'px';
                this.style.left = mousePosX + 'px';
                break;
            }
            case DRAG_ANCHOR.TOP: {
                let yDiff = mousePosY - this.offsetTop;
                this.style.height = (this.offsetHeight - yDiff -
                    window.getComputedStyle(this).paddingTop.replace('px', '') - 
                    window.getComputedStyle(this).paddingBottom.replace('px', '') -
                    window.getComputedStyle(this).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderBottomWidth.replace('px', '')) + 'px';
                this.style.top = mousePosY + 'px';
                break;
            }
            case DRAG_ANCHOR.RIGHT: {
                let xRemainder = mousePosX - this.offsetLeft;
                this.style.width = (xRemainder -
                    window.getComputedStyle(this).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(this).paddingRight.replace('px', '') -
                    window.getComputedStyle(this).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderRightWidth.replace('px', '')) + 'px';
                break;
            }
            case DRAG_ANCHOR.BOTTOM: {
                let yRemainder = mousePosY - this.offsetTop;
                this.style.height = (yRemainder -
                    window.getComputedStyle(this).paddingTop.replace('px', '') - 
                    window.getComputedStyle(this).paddingBottom.replace('px', '') -
                    window.getComputedStyle(this).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(this).borderBottomWidth.replace('px', '')) + 'px';
                break;
            }
        }
    }
}
window.customElements.define('paste-overlay', PasteOverlay);

class BodyOverlay extends HTMLElement {
    constructor() {
        super();

        this.classList.add('hidden');
    }
}
window.customElements.define('body-overlay', BodyOverlay);

class PasteWrapper extends HTMLElement {
    constructor(pasteContainer) {
        super();

        this.append(pasteContainer);
        this.style.cssText = pasteContainer.style.cssText;

        this.addEventListener('mouseenter', (mouseEvent) => {
            let pasteToolbar = document.querySelector('paste-toolbar');
            pasteToolbar.classList.remove('hidden');
            pasteToolbar.style.left = mouseEvent.clientX + 'px';
            pasteToolbar.style.top = mouseEvent.clientY + 'px';
        });
    }

    get pasteContainer() {
        return this.firstChild;
    }
}
window.customElements.define('paste-wrapper', PasteWrapper);

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'Enter': {
            if (document.cropMode) {
                // TODO: Broken for crop from top and left.
                document.pasteWrapper.style.position = 'absolute';
                let pasteOverlay = document.querySelector('paste-overlay');
                document.pasteWrapper.style.left = pasteOverlay.offsetLeft + 'px';
                document.pasteWrapper.style.top = pasteOverlay.offsetTop + 'px';
                document.pasteWrapper.style.width = pasteOverlay.offsetWidth + 'px';
                document.pasteWrapper.style.height = pasteOverlay.offsetHeight + 'px';
            }
            // fallthrough
        }
        case 'Escape': {
            document.querySelector('body-overlay').classList.add('hidden');
            document.querySelector('paste-overlay').classList.add('hidden');
            document.cropMode = false;
            document.resizeMode = false;
            break;
        }
    }
});

let header = document.createElement('h3');
header.append('Paste from Smart Copy into container below:');
let ceContainer = document.createElement('div');
ceContainer.setAttribute('id', 'ceContainer');
ceContainer.setAttribute('contenteditable', 'true');
ceContainer.addEventListener('paste', (pasteEvent) => {
    pasteEvent.preventDefault();
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    range.deleteContents();
    document.pasteWrapper = new PasteWrapper(getPasteHTML());
    range.insertNode(document.pasteWrapper);
    range.collapse();
    selection.removeAllRanges();
    selection.addRange(range);

    let pasteOverlay = new PasteOverlay(document.pasteWrapper.offsetLeft, document.pasteWrapper.offsetTop,
        document.pasteWrapper.offsetWidth, document.pasteWrapper.offsetHeight);
    document.body.append(pasteOverlay);

    document.addEventListener('mousedown', (mouseEvent) => document.querySelector('paste-overlay').updateDragAnchor(mouseEvent.clientX, mouseEvent.clientY));

    document.addEventListener('mousemove', (mouseEvent) => {
        let pasteOverlay = document.querySelector('paste-overlay');
        pasteOverlay.adjustForDrag(mouseEvent.clientX, mouseEvent.clientY);
        if (document.resizeMode) {
            // TODO: Broken for resize from top and left.
            if (pasteOverlay.dragAnchor != DRAG_ANCHOR.NONE) {
                let xScaleFactor = pasteOverlay.offsetWidth / document.pasteWrapper.offsetWidth;
                let yScaleFactor = pasteOverlay.offsetHeight / document.pasteWrapper.offsetHeight;
                document.pasteWrapper.style.transformOrigin = 'top left';
                document.pasteWrapper.style.transform = 'scale(' + xScaleFactor + ',' + yScaleFactor + ')';
            }
        }
    });

    document.addEventListener('mouseup', () => document.querySelector('paste-overlay').resetDragAnchor());
});

let pasteToolbar = new PasteToolbar();
let bodyOverlay = new BodyOverlay();
document.body.append(header, ceContainer, pasteToolbar, bodyOverlay);