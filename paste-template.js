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
            document.getElementById('bodyOverlay').classList.remove('hidden');
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

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'Enter': {
            if (document.cropMode) {
                // TODO: Broken for crop from top and left.
                let pasteOverlay = document.querySelector('paste-overlay');
                document.pasteContainer.style.position = 'absolute';
                document.pasteContainer.style.left = pasteOverlay.offsetLeft + 'px';
                document.pasteContainer.style.top = pasteOverlay.offsetTop + 'px';
                document.pasteContainer.style.width = pasteOverlay.offsetWidth + 'px';
                document.pasteContainer.style.height = pasteOverlay.offsetHeight + 'px';
            }
            // fallthrough
        }
        case 'Escape': {
            document.getElementById('bodyOverlay').classList.add('hidden');
            document.querySelector('paste-overlay').classList.add('hidden');
            document.cropMode = false;
            document.resizeMode = false;
            break;
        }
    }
});

function pasteCallback(pasteEvent) {
    pasteEvent.preventDefault();
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    range.deleteContents();
    document.pasteContainer = getPasteHTML();
    range.insertNode(document.pasteContainer);
    range.collapse();
    selection.removeAllRanges();
    selection.addRange(range);

    let pasteOverlay = new PasteOverlay(document.pasteContainer.offsetLeft, document.pasteContainer.offsetTop,
        document.pasteContainer.offsetWidth, document.pasteContainer.offsetHeight);
    document.body.append(pasteOverlay);
    document.pasteContainer.addEventListener('mouseenter', (event) => {
        let pasteToolbar = document.querySelector('paste-toolbar');
        pasteToolbar.classList.remove('hidden');
        pasteToolbar.style.left = event.clientX + 'px';
        pasteToolbar.style.top = event.clientY + 'px';
    });

    document.pasteContainer.addEventListener('mouseleave', () => {
        let pasteToolbar = document.querySelector('paste-toolbar');
        pasteToolbar.classList.add('hidden');
    });

    document.addEventListener('mousedown', (mouseEvent) => {
        let pasteOverlay = document.querySelector('paste-overlay');
        pasteOverlay.updateDragAnchor(mouseEvent.clientX, mouseEvent.clientY);
    });
    document.addEventListener('mousemove', (mouseEvent) => {
        let pasteOverlay = document.querySelector('paste-overlay');
        pasteOverlay.adjustForDrag(mouseEvent.clientX, mouseEvent.clientY);
        if (document.resizeMode) {
            // TODO: Broken for resize from top and left.
            if (pasteOverlay.dragAnchor != DRAG_ANCHOR.NONE) {
                let xScaleFactor = pasteOverlay.offsetWidth / document.pasteContainer.offsetWidth;
                let yScaleFactor = pasteOverlay.offsetHeight / document.pasteContainer.offsetHeight;
                document.pasteContainer.style.transformOrigin = 'top left';
                document.pasteContainer.style.transform = 'scale(' + xScaleFactor + ',' + yScaleFactor + ')';
            }
        }
    });
    document.addEventListener('mouseup', (mouseEvent) => {
        document.querySelector('paste-overlay').resetDragAnchor();
    });
}

let header = document.createElement('h3');
header.append('Paste from Smart Copy into container below:');
let ceContainer = document.createElement('div');
ceContainer.setAttribute('id', 'ceContainer');
ceContainer.setAttribute('contenteditable', 'true');
ceContainer.addEventListener('paste', pasteCallback);
let pasteToolbar = new PasteToolbar();
let bodyOverlay = document.createElement('div');
bodyOverlay.setAttribute('id', 'bodyOverlay');
bodyOverlay.classList.add('hidden');
document.body.append(header, ceContainer, pasteToolbar, bodyOverlay);