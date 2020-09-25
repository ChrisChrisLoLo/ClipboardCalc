chrome.runtime.onMessage.addListener(
function(message, sender, sendResponse) {
    if (message.messageId === 'dialogue'){
        createDialogue(message.dialogueMessage);
    }
    else if (message.messageId === 'writeToClipboard'){
        navigator.clipboard.writeText(message.value.toString()).then(() => {
            console.log('Wrote results to clipboard');
        }, function(e) {
            console.warn(e);
        });
    }
    //Todo: should use this to send back useful information
    sendResponse({});
});

const DIALOGUE_STYLE = {
    position: 'fixed',
    // 3000000 is a value that is roughly appropriate for the dialogue window.
    zIndex: '3000000',
    height: 'auto',
    width: 'auto',
    textAlign: 'left',
    color: '#000000',
    background: '#ededed',
    borderRadius: '1px',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: '#000000',
    fontFamily: 'monospace'
};

//offset so that the box appears slightly above the cursor
const DIALOGUE_Y_OFFSET = -10;
const DIALOGUE_X_OFFSET = 10;
const DIALOGUE_DURATION_MS = 800;

let mouseX = 0;
let mouseY = 0;

function onMouseUpdate(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    console.log(e.clientX, e.clientY);
}

document.addEventListener('mousemove', onMouseUpdate, false);

function createDialogue(dialogueMessage){
    console.log(dialogueMessage);
    const dialogueElem = document.createElement('div');

    let style = {...DIALOGUE_STYLE, top: `${mouseY+DIALOGUE_Y_OFFSET}px`, left: `${mouseX+DIALOGUE_X_OFFSET}px`};
    Object.assign(dialogueElem.style, style);

    dialogueElem.innerText = dialogueMessage;

    document.body.appendChild(dialogueElem);

    setTimeout(() => {
        dialogueElem.parentElement.removeChild(dialogueElem);
    }, DIALOGUE_DURATION_MS);
}