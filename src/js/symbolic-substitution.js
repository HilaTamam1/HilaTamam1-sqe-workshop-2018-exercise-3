let idlocalVariable = [];
let indexID = 0;
let copy = [];
let copyBool = [];
let localVariable = [];
let input = [];
let idInput = [];
let indexOfFunction = 0;
let countParams = 0;
let conditions = [];
let returnValues = [];
let inputValuePrint = [];
let ifs = 0;
let ifStatementBool = false;
let indexReturn = 0;
let indexCondtion = 0;
let indexInput = 0;
let endFunction;

//the main function
function symbolicSub(infoTable, codeToParse) {
    let lines = codeToParse.split('\n');
    getIndexofFuncDec(infoTable);
    getInput(infoTable);
    addGloblal(infoTable);
    createVariableTable(infoTable);
    lines = changeCode(lines);
    return printCode(lines);
}

//print the code after simbolic substitution. 
function printCode(lines) {
    let newCode = '';
    for (let index = 0; index < lines.length; index++) {
        const element = lines[index];
        if (element != -1)
            newCode = newCode + element + '\n';
    }
    return newCode;
}

//change the code according to the simbolic substitution. 
function changeCode(lines) {
    for (let index = 0; index < lines.length; index++) {
        const element = lines[index];
        if (element.includes('return'))
            lines[index] = returnCode(element);
        else if (containWhileOrIf(element))
            lines[index] = conditionCode(element);
        else
            lines[index] = changeCode2(element);
    }
    return lines;
}

function changeCode2(element) {
    if (checkAssigmentInput(element))
        return expressionInputCode(element);
    if (sameLine(element))
        return element;
    return -1;
}

//check if the line has to change. 
function sameLine(element) {
    if (element.includes('function'))
        return true;
    if (element.includes('{'))
        return true;
    if (element.includes('}'))
        return true;
    return false;

}


function containWhileOrIf(element) {
    return (element.includes('while') || element.includes('if'));
}

function checkAssigmentInput(element) {
    return (element.includes('=') && checkInputExpression(element));
}

function checkInputExpression(element) {
    let name;
    let elementAfterSplit = element.split('=');
    name = elementAfterSplit[0].trim();
    if (idInput.includes(name))
        return true;
    return false;
}

function expressionInputCode(element) {
    var before = element.substring(0, element.indexOf('=') + 1);
    var value = element.substring(element.indexOf('=') + 1);
    if (inputValuePrint[indexInput]) {
        var line = before + ' ' + value.replace(value, inputValuePrint[indexInput].Value) + ';';
        indexInput++;
        return line;
    }
    return -1;
}

/*change return statement. */
function returnCode(element) {
    var before = element.substring(0, element.indexOf('n') + 1);
    var value = element.substring(element.indexOf('n') + 1);
    var line = before + ' ' + value.replace(value, returnValues[indexReturn].Value) + ';';
    indexReturn++;
    return line;
}

/*change if statement. */
function conditionCode(element) {
    var before = element.substring(0, element.indexOf('(') + 1);
    var cond = element.substring(element.indexOf('(') + 1, element.indexOf(')'));
    var line = before + cond.replace(cond, conditions[indexCondtion].Condition) + ') {';
    indexCondtion++;
    return line;
}

/*return the table with params*/
function getInput(table) {
    let i = indexOfFunction;
    let line = table[indexOfFunction].Line;
    while (table[i].Line == line) {
        if (table[i].Type == 'variable declaration') {
            idInput.push(table[i].Name);
            countParams++;
        }
        i++;
    }
}

function pushInInputToPrint(name, value) {
    let assInput = {};
    assInput.Name = name;
    assInput.Value = value;
    inputValuePrint.push(assInput);
}

function createVariableTable(table) {
    for (let index = countParams + indexOfFunction + 1; index < table.length; index++) {
        if (table[index].Start < endFunction) {
            const element = table[index];
            ifstatementTrue(element);
            if (checkVariableOrAssignment(element))
                variableOrAssignment(element.Name, table, index);
            else createVariableTable2(element, index);
        }
    }
}

function createVariableTable2(element, index) {
    if (checkIfElseWhile(element))
        conditionState(element, index);
    else
        returnState(element.Value, index);
}

function ifstatementTrue(element) {
    if (ifStatementBool) {
        let startIf = parseInt(element.Start);
        if (startIf >= copy[copy.length - 1].IndexEnd)
            preReCopy(startIf);
    }
}

function checkVariableOrAssignment(element) {
    if (element.Type == 'variable declaration')
        return true;
    if (element.Type == 'assignment expression')
        return true;
    return false;
}

function checkIfElseWhile(element) {
    if (element.Type == 'if statement')
        return true;
    if (element.Type == 'else statement')
        return true;
    if (element.Type == 'else if statement')
        return true;
    if (element.Type == 'while statement')
        return true;
    return false;
}

function preReCopy(startIf) {

    for (let index = copy.length - 1; index >= 0; index--) {
        const element = copy[index].IndexEnd;
        if (startIf >= element)
            checkIfReCopyAlready(index);
    }
    if (ifs == 0)
        ifStatementBool = false;
}

function checkIfReCopyAlready(index) {
    if (copyBool[index] == false) {
        ReCopyTables(copy[index].Input, copy[index].LocalVar, copy[index].IDS);
        copyBool[index] = true;
        ifs--;
    }
}

function variableOrAssignment(elementName, table, index) {
    if (idlocalVariable.includes(elementName))
        localVariable[elementName] = value(table, index);
    else
        variableOrAssignment2(elementName, table, index);
}

function variableOrAssignment2(elementName, table, index) {
    let valueString = value(table, index);
    if (valueString.indexOf('[') == 0 && valueString.indexOf(']') == valueString.length - 1) {
        valueString = valueString.substring(valueString.indexOf('[') + 1, valueString.indexOf(']'));
        let values = valueString.split(',');
        for (let i = 0; i < values.length; i++) {
            localVariable[elementName + '[' + i + ']'] = getAllAns(values[i]);
            addToIdLocalVar(elementName + '[' + i + ']');
        }
    }
    localVariable[elementName] = value(table, index);
    // if (input.includes(elementName))
    if (idInput.includes(elementName))
        pushInInputToPrint(elementName, localVariable[elementName]);
    addToIdLocalVar(elementName);
}

function addToIdLocalVar(elementName) {
    if (idlocalVariable.includes(elementName) == false && idInput.includes(elementName) == false) {
        idlocalVariable[indexID] = elementName;
        indexID++;
    }
}

function conditionState(element, index) {
    ifStatementBool = true;
    copyTables(parseInt(element.End));
    if (element.Type != 'else statement') {
        conditionWithInput(element.Condition, index);
    }
}

function returnState(elemReturn, index) {
    var retStat = {};
    retStat.Index = index;
    retStat.Value = getAllAns(elemReturn);
    returnValues.push(retStat);
}

function conditionWithInput(elemCond, index) {
    let ans = '';
    let condAfterSplit = (elemCond + '').split(' ');
    for (let index = 0; index < condAfterSplit.length; index++) {
        const element = condAfterSplit[index];
        let elem = elemSplit(element);
        ans = ans + elem;
    }
    var cond = {};
    cond.Index = index;
    cond.Condition = ans;
    conditions.push(cond);
}

function elemSplit(element) {
    element = '' + element;
    if (idInput.includes(element) && (input[element]))
        return input[element];
    else if (localVariable[element])
        return localVariable[element];
    else return ' ' + element + ' ';
}

function addGloblal(table) {
    for (let index = 0; index < indexOfFunction; index++)
        valueGlobal(table, index);
    for (let index = countParams + indexOfFunction + 1; index < table.length; index++) {
        if (table[index].Start > endFunction)
            valueGlobal(table, index);
    }
}

function valueGlobal(table, index) {
    let element = table[index];
    if (idInput.includes(element.Name) == false)
        idInput.push(element.Name);
    let val = table[index].Value;
    valueGlobal1(val, element);
}

function valueGlobal1(val, element) {
    if (val)
        input[element.Name] = getAllAns(val);
}

/*get the value of the element after simbolic substitution. */
function value(table, index) {
    let value = table[index].Value + '';
    if (value.indexOf('[') != 0 || value.indexOf(']') != value.length - 1) {
        return getAllAns(value);
    }
    return value;

}

function getAllAns(value) {
    let ans = '';
    let valueAfterSplit = (value + '').split(' ');
    for (let index = 0; index < valueAfterSplit.length; index++) {
        const element = valueAfterSplit[index];
        let elem = elemSplit(element);
        ans = getAns(elem, ans);
    }
    return ans;
}

function getAns(elem, ans) {
    if ((elem == ' * ' || elem == ' / ') && ans.length > 6)
        return '(' + ans + ')' + elem;
    else
        return ans + elem;
}

/*copy the table - it's if statement. */
function copyTables(endIndex) {
    let copyLocalVariable = [];
    let copyInput = [];
    let IDs = [];
    for (let index = 0; index < idlocalVariable.length; index++) {
        const element = idlocalVariable[index];
        IDs.push(element);
    }
    for (let index = 0; index < idlocalVariable.length; index++) {
        const element = localVariable[idlocalVariable[index]];
        copyLocalVariable[idlocalVariable[index]] = element;
    }
    for (let index = 0; index < idInput.length; index++) {
        const element = input[idInput[index]];
        copyInput[idInput[index]] = element;
    }
    pushElementCopy(copyLocalVariable, copyInput, endIndex, IDs);
}

/*push the copy tables into array.*/
function pushElementCopy(copyLocalVariable, copyInput, endIndex, IDs) {
    let elementCopy = {};
    elementCopy.LocalVar = copyLocalVariable;
    elementCopy.Input = copyInput;
    elementCopy.IndexEnd = endIndex;
    elementCopy.IDS = IDs;
    copy.push(elementCopy);
    copyBool.push(false);
    ifs++;
}

/*recopy the tables. */
function ReCopyTables(copyInput, copyLocalVariable, idS) {
    localVariable = [];
    input = [];
    idlocalVariable = [];
    for (let index = 0; index < idS.length; index++) {
        const element = idS[index];
        idlocalVariable.push(element);
    }
    for (let index = 0; index < idS.length; index++) {
        const element = copyLocalVariable[idS[index]];
        localVariable[idS[index]] = element;
    }
    for (let index = 0; index < idInput.length; index++) {
        const element = copyInput[idInput[index]];
        input[idInput[index]] = element;
    }
}

/*clear*/
function clearSymbolic() {
    idlocalVariable = [];
    idInput = [];
    indexID = 0;
    copy = [];
    copyBool = [];
    localVariable = [];
    input = [];
    indexOfFunction = 0;
    countParams = 0;
    conditions = [];
    returnValues = [];
    inputValuePrint = [];
    ifs = 0;
    ifStatementBool = false;
    indexReturn = 0;
    indexCondtion = 0;
    indexInput = 0;
}

/*return the num of params. */
function getNumParams() {
    return countParams;
}

/*return the index of the function declaration*/
function getIndexofFuncDec(table) {
    let i = 0;
    while (table[i].Type != 'function declaration')
        i++;
    indexOfFunction = i;
    endFunction = table[indexOfFunction].End;
}

/*return the inputs id.*/
function getIdInput() {
    return idInput;
}

/*return the line of the code after simbolic substitution.*/
function getLines(code) {
    return code.split('\n');
}

export { symbolicSub };
export { getIdInput };
export { clearSymbolic };
export { getLines };
export { getNumParams };

