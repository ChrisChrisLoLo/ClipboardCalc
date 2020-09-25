const OP_SYMBOLS = ['+', '-', '*', '/', '^'];

/**
 * Operations that get pushed onto the array.
 * Consists of a number as well as the operator.
 * Numbers are numeric
 * Operators can be one of "+","-","*","/","^"
 */
class CalcOperation {
    constructor(number, operatorString) {
        this.number = number;
        this.operatorString = operatorString;
    }
}

/**
 * Get the selected input and attempt to push it onto the operation array
 */
function copyInput(){
    chrome.tabs.executeScript( {
        code: "window.getSelection().toString();"
    }, function(selection) {
        if(selection[0] != null){
            console.log(selection[0]);
            attemptPushingOperation(selection[0]);
        }
    });
}

/**
 * Determine if string is a number, and push it onto the operation array if it is
 * @param value
 */
function attemptPushingOperation(value){
    const formattedValueStr = value.trim().replace(/,/g,'');
    const floatValue = parseFloat(formattedValueStr);
    if(isNaN(floatValue)){
        printDialogue(`Selected value is not a number!`)
    }
    else{
        chrome.storage.sync.get(['currOp', 'opArr'], (getResult)=>{
            let newArr = [...getResult.opArr];
            newArr.push(new CalcOperation(floatValue, getResult.currOp));
            chrome.storage.sync.set({opArr:newArr}, (setResult)=>{
                printDialogue(`Pushed (${getResult.currOp}, ${formattedValueStr})`)
            });
        });
    }
}

/**
 * Calculate the result of the op array and writes it to the clip board.
 * Clears the op array afterwards.
 */
function pasteResult(){
    chrome.storage.sync.get(['opArr'], (getResult)=>{
        const opArr = getResult.opArr;

        const result = calcResult(opArr);

        // Send to clipboard only if operations have been added
        // This prevents the clipboard from being cleared.
        if (opArr.length > 0){
            sendToClipboard(result);
        }

        chrome.storage.sync.set({opArr:[]}, ()=>{
            printDialogue(`Calculated ${result}`)
        });
    });
}

function calcResult(opArr){
    let result = 0;
    for(let i in opArr){
        const op = opArr[i];
        switch (op.operatorString) {
            case '+':
                result += op.number;
                break;
            case '-':
                result -= op.number;
                break;
            case '*':
                result *= op.number;
                break;
            case '/':
                result /= op.number;
                break;
            case '^':
                result **= op.number;
                break;
            default:
                printDialogue(`Cannot calculate: Operation ${op.operatorString} is unknown!`)
        }
    }
    return result;
}

function changeOperator(){
    chrome.storage.sync.get(['currOp'], (getResult)=>{
        const currOp = getResult.currOp;
        const newOpInd = (OP_SYMBOLS.indexOf(currOp)+1) % OP_SYMBOLS.length;
        const newOp = OP_SYMBOLS[newOpInd];
        chrome.storage.sync.set({currOp:newOp}, (setResult)=>{
            printDialogue(newOp);
        });
    });
}

function displayOperations(){
    chrome.storage.sync.get(['opArr', 'currOp'], (getResult)=>{
        const opArr = getResult.opArr;
        let operationSheet = '';

        operationSheet += `Current Op: ${getResult.currOp} \r\n\r\n`;

        operationSheet += 'Operations: \r\n';
        if (opArr.length > 0){
            // Create list of operations
            for (let i in opArr){
                const op = opArr[i];
                operationSheet += `${op.operatorString} ${op.number} \r\n`;
            }
            // Create underline that's as long as the longest operation
            operationSheet += '_'.repeat(Math.max(...(opArr.map(el => el.number.toString().length)))+2) + '\r\n';
            operationSheet += calcResult(opArr).toString();
        }
        printDialogue(operationSheet);
    });
}

function printDialogue(dialogueMessage){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {messageId: 'dialogue', dialogueMessage: dialogueMessage}, function(response) {
            console.log(`Message "${dialogueMessage}" sent`);
        });
    });
}

function sendToClipboard(value){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {messageId: 'writeToClipboard', value: value}, function(response) {
            console.log(`Clipboard value "${value}" sent`);
        });
    });
}