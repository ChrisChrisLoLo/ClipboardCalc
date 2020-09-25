const APP_DEFAULTS = {
    opArr:[],
    currOp:'+'
};

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set(APP_DEFAULTS);
});

chrome.commands.onCommand.addListener(function(command) {
    console.log('Command:', command);

    switch(command) {
        case 'copy-input':
            copyInput();
            break;
        case 'paste-calc':
            pasteResult();
            break;
        case 'change-operator':
            changeOperator();
            break;
        case 'display-operations':
            displayOperations();
            break;
        default:
            console.warn(`Command: ${command} is unknown`)
    }
});

