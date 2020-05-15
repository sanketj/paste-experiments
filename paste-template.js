const DRAG_POSITION = {
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

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'Enter': {
            if (document.cropMode) {
                commitCrop();
            }
            // fallthrough
        }
        case 'Escape': {
            document.bodyOverlay.style.display = 'none';
            document.pasteContainerOverlay.style.display = 'none';
            document.cropMode = false;
            document.scaleMode = false;
            break;
        }
    }
});

function commitCrop() {
    // TODO: Broken for crop from top and/or left.
    document.pasteContainer.style.position = 'absolute';
    document.pasteContainer.style.left = document.pasteContainerOverlay.offsetLeft + 'px';
    document.pasteContainer.style.top = document.pasteContainerOverlay.offsetTop + 'px';
    document.pasteContainer.style.width = document.pasteContainerOverlay.offsetWidth + 'px';
    document.pasteContainer.style.height = document.pasteContainerOverlay.offsetHeight + 'px';
}

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

    document.pasteContainerOverlay = document.createElement('div');
    document.pasteContainerOverlay.setAttribute('id', 'pasteContainerOverlay');
    document.pasteContainerOverlay.style.position = 'absolute';
    document.pasteContainerOverlay.style.width = document.pasteContainer.offsetWidth + 'px';
    document.pasteContainerOverlay.style.height = document.pasteContainer.offsetHeight + 'px';
    document.pasteContainerOverlay.style.left = document.pasteContainer.offsetLeft + 'px';
    document.pasteContainerOverlay.style.top = document.pasteContainer.offsetTop + 'px';
    document.pasteContainerOverlay.style.border = '1px dashed white';
    document.pasteContainerOverlay.style.display = 'none';
    document.pasteContainerOverlay.style.overflow = 'hidden';
    document.body.append(document.pasteContainerOverlay);

    document.pasteContainer.addEventListener('mouseenter', (event) => {
        let toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'block';
        toolbar.style.left = event.clientX + 'px';
        toolbar.style.top = event.clientY + 'px';
    });

    document.pasteContainer.addEventListener('mouseleave', () => {
        let toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'none';
    });

    document.addEventListener('mousedown', (mouseEvent) => {
        document.pasteContainerOverlay.dragPosition = findDragPosition(mouseEvent.clientX, mouseEvent.clientY);
    });
    document.addEventListener('mousemove', (mouseEvent) => {
        adjustPasteOverlay(mouseEvent);
    });
    document.addEventListener('mouseup', (mouseEvent) => {
        document.pasteContainerOverlay.dragPosition = DRAG_POSITION.UNDEFINED;
    });

    document.getElementById('cropButton').addEventListener('click', () => {
        document.bodyOverlay.style.display = 'block';
        document.pasteContainerOverlay.style.display = 'block';
        document.cropMode = true;
    });

    document.getElementById('scaleButton').addEventListener('click', () => {
        document.bodyOverlay.style.display = 'block';
        document.pasteContainerOverlay.style.display = 'block';
        document.scaleMode = true;

        document.addEventListener('mousemove', () => {
            if (document.pasteContainerOverlay.dragPosition != DRAG_POSITION.UNDEFINED) {
                // TODO: Figure out how to scale
                let xScaleFactor =
                    (document.pasteContainerOverlay.offsetWidth - document.pasteContainerOverlay.offsetWidth) / document.pasteContainer.offsetWidth;
                xScaleFactor = xScaleFactor == 0 ? 1 : xScaleFactor;
                let yScaleFactor =
                    (document.pasteContainerOverlay.offsetHeight - document.pasteContainer.offsetHeight) / document.pasteContainer.offsetHeight;
                yScaleFactor = yScaleFactor == 0 ? 1 : yScaleFactor;
                // let xTranslateFactor = document.pasteContainer.offsetWidth - document.pasteContainerOverlay.offsetWidth;
                // let yTranslateFactor = document.pasteContainer.offsetHeight - document.pasteContainerOverlay.offsetHeight;
                document.pasteContainer.style.transform =
                    'scale(' + xScaleFactor + ',' + yScaleFactor + ')';
            }
        });
    });

    function adjustPasteOverlay(mouseEvent) {
        switch (document.pasteContainerOverlay.dragPosition) {
            case DRAG_POSITION.TOP_LEFT: {
                let xDiff = mouseEvent.clientX - document.pasteContainerOverlay.offsetLeft;
                let yDiff = mouseEvent.clientY - document.pasteContainerOverlay.offsetTop;
                document.pasteContainerOverlay.style.width = (document.pasteContainerOverlay.offsetWidth - xDiff -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingRight.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderRightWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.height = (document.pasteContainerOverlay.offsetHeight - yDiff -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingTop.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingBottom.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderBottomWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.left = mouseEvent.clientX + 'px';
                document.pasteContainerOverlay.style.top = mouseEvent.clientY + 'px';
                break;
            }
            case DRAG_POSITION.BOTTOM_LEFT: {
                let xDiff = mouseEvent.clientX - document.pasteContainerOverlay.offsetLeft;
                let yRemainder = mouseEvent.clientY - document.pasteContainerOverlay.offsetTop;
                document.pasteContainerOverlay.style.width = (document.pasteContainerOverlay.offsetWidth - xDiff -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingRight.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderRightWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.height = (yRemainder -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingTop.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingBottom.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderBottomWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.left = mouseEvent.clientX + 'px';
                break;
            }
            case DRAG_POSITION.BOTTOM_RIGHT: {
                let xRemainder = mouseEvent.clientX - document.pasteContainerOverlay.offsetLeft;
                let yRemainder = mouseEvent.clientY - document.pasteContainerOverlay.offsetTop;
                document.pasteContainerOverlay.style.width = (xRemainder -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingRight.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderRightWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.height = (yRemainder -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingTop.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingBottom.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderBottomWidth.replace('px', '')) + 'px';
                break;
            }
            case DRAG_POSITION.TOP_RIGHT: {
                let xRemainder = mouseEvent.clientX - document.pasteContainerOverlay.offsetLeft;
                let yDiff = mouseEvent.clientY - document.pasteContainerOverlay.offsetTop;
                document.pasteContainerOverlay.style.width = (xRemainder -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingRight.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderRightWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.height = (document.pasteContainerOverlay.offsetHeight - yDiff -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingTop.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingBottom.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderBottomWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.top = mouseEvent.clientY + 'px';
                break;
            }
            case DRAG_POSITION.LEFT: {
                let xDiff = mouseEvent.clientX - document.pasteContainerOverlay.offsetLeft;
                document.pasteContainerOverlay.style.width = (document.pasteContainerOverlay.offsetWidth - xDiff -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingRight.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderRightWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.left = mouseEvent.clientX + 'px';
                break;
            }
            case DRAG_POSITION.TOP: {
                let yDiff = mouseEvent.clientY - document.pasteContainerOverlay.offsetTop;
                document.pasteContainerOverlay.style.height = (document.pasteContainerOverlay.offsetHeight - yDiff -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingTop.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingBottom.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderBottomWidth.replace('px', '')) + 'px';
                document.pasteContainerOverlay.style.top = mouseEvent.clientY + 'px';
                break;
            }
            case DRAG_POSITION.RIGHT: {
                let xRemainder = mouseEvent.clientX - document.pasteContainerOverlay.offsetLeft;
                document.pasteContainerOverlay.style.width = (xRemainder -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingLeft.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingRight.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderLeftWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderRightWidth.replace('px', '')) + 'px';
                break;
            }
            case DRAG_POSITION.BOTTOM: {
                let yRemainder = mouseEvent.clientY - document.pasteContainerOverlay.offsetTop;
                document.pasteContainerOverlay.style.height = (yRemainder -
                    window.getComputedStyle(document.pasteContainerOverlay).paddingTop.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).paddingBottom.replace('px', '') -
                    window.getComputedStyle(document.pasteContainerOverlay).borderTopWidth.replace('px', '') - 
                    window.getComputedStyle(document.pasteContainerOverlay).borderBottomWidth.replace('px', '')) + 'px';
                break;
            }
        }
    }

    function findDragPosition(mousePosX, mousePosY) {
        const TOLERANCE = 5;
        let boundingRect = document.pasteContainerOverlay.getBoundingClientRect();
        let left = Math.round(boundingRect.left);
        let right = Math.round(boundingRect.right);
        let top = Math.round(boundingRect.top);
        let bottom = Math.round(boundingRect.bottom);
        if (Math.abs(left - mousePosX) <= TOLERANCE && Math.abs(top - mousePosY) <= TOLERANCE) {
            return DRAG_POSITION.TOP_LEFT;
        } else if (Math.abs(left - mousePosX) <= TOLERANCE && Math.abs(bottom - mousePosY) <= TOLERANCE) {
            return DRAG_POSITION.BOTTOM_LEFT;
        } else if (Math.abs(right - mousePosX) <= TOLERANCE && Math.abs(bottom - mousePosY) <= TOLERANCE) {
            return DRAG_POSITION.BOTTOM_RIGHT;
        } else if (Math.abs(right - mousePosX) <= TOLERANCE && Math.abs(top - mousePosY) <= TOLERANCE) {
            return DRAG_POSITION.TOP_RIGHT;
        } else if (Math.abs(left - mousePosX) <= TOLERANCE && top - TOLERANCE < mousePosY && mousePosY < bottom + TOLERANCE) {
            return DRAG_POSITION.LEFT;
        } else if (left - TOLERANCE < mousePosX && mousePosX < right + TOLERANCE && Math.abs(bottom - mousePosY) <= TOLERANCE) {
            return DRAG_POSITION.BOTTOM;
        } else if (Math.abs(right - mousePosX) <= TOLERANCE && top - TOLERANCE < mousePosY && mousePosY < bottom + TOLERANCE) {
            return DRAG_POSITION.RIGHT;
        } else if (left - TOLERANCE < mousePosX && mousePosX < right + TOLERANCE && Math.abs(top - mousePosY) <= TOLERANCE) {
            return DRAG_POSITION.TOP;
        } else {
            return DRAG_POSITION.NONE;
        }
    }
}

let pasteHeader = document.createElement('h3');
pasteHeader.append('Paste from Smart Copy into container below:');
let ceContainer = document.createElement('div');
ceContainer.setAttribute('contenteditable', 'true');
ceContainer.style.minHeight = '200px';
ceContainer.style.border = '1px solid black';
ceContainer.style.padding = '10px';
ceContainer.style.overflow = 'auto';
document.body.append(pasteHeader, ceContainer);
ceContainer.addEventListener('paste', pasteCallback);

let toolbar = document.createElement('div');
toolbar.style.display = 'none';
toolbar.style.position = 'absolute';
toolbar.setAttribute('id', 'toolbar');
let cropButton = document.createElement('button');
cropButton.setAttribute('id', 'cropButton');
cropButton.append('Crop');
let scaleButton = document.createElement('button');
scaleButton.setAttribute('id', 'scaleButton');
scaleButton.append('Scale');
toolbar.append(cropButton, scaleButton);
toolbar.addEventListener('mouseenter', () => toolbar.style.display = 'block');
toolbar.addEventListener('mouseleave', () => toolbar.style.display = 'none');
document.body.append(toolbar);

document.bodyOverlay = document.createElement('div');
document.bodyOverlay.style.position = 'fixed';
document.bodyOverlay.style.width = '100%';
document.bodyOverlay.style.height = '100%';
document.bodyOverlay.style.left = 0;
document.bodyOverlay.style.top = 0;
document.bodyOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
document.bodyOverlay.style.display = 'none';
document.body.append(document.bodyOverlay);