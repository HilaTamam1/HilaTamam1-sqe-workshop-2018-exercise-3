import * as esgraph from 'esgraph';

let ifs = [];
let idIFS = [];
let numOfPointers = [];
let pointersArray = [];
let typeShape = [];
let labels = [];
let lastN;
let lines = [];
let toColor = [];
let inputAndVariable = [];
let pointersIF = [];

// console.log(numOfPointers);
// console.log(pointersArray);
// console.log(typeShape);
// console.log(labels);
// console.log(inputAndVariable);
// console.log(toColor);
// console.log(idIFS);
// console.log(lines);

function createBasicGraph(basicCode, parsedCode, args, idInput) {
    let CFG = esgraph(parsedCode.body[0].body);
    let basicGraph = esgraph.dot(CFG, { counter: 0, source: basicCode });
    let changedGraph = changeGraph(basicGraph, args, idInput);
    return changedGraph;
}

function changeGraph(basicGraph, args, idInput) {
    updateInput(args, idInput);
    lines = basicGraph.split('\n');
    changeShape();
    removeEntryExit(lines);
    removeLetVar(lines);
    unionLines(lines);
    clearLines();
    numbering();
    fillPointers();
    getIndexColor();
    changeColor();
    return getFullLines();
}

function updateInput(args, idInput) {
    let argsArray = args.split(', ');
    for (let i = 0; i < idInput.length; i++) {
        if (argsArray[i].includes('[') == false)
            inputAndVariable[idInput[i]] = argsArray[i];
        else {
            inputAndVariable[idInput[i]] = argsArray[i];
            let elementsArray = getElementsArray(argsArray[i]);
            pushElementArray(elementsArray, idInput[i]);
        }
    }
}

function getElementsArray(inputElement) {
    let leftIndex = inputElement.indexOf('[');
    let rightIndex = inputElement.indexOf(']');
    let elementsArray = inputElement.substring(leftIndex + 1, rightIndex);
    return elementsArray;
}

function pushElementArray(elements, idInput) {
    let elementsArray = elements.split(',');
    for (let i = 0; i < elementsArray.length; i++)
        inputAndVariable[idInput + '[' + i + ']'] = elementsArray[i];
}

function changeShape() {
    for (let index = 0; index < lines.length; index++) {
        if (lines[index].includes('->') == false)
            lines[index] = lines[index].substring(0, lines[index].length - 1) + ' shape="box" ]';
        changeLabelIf(index);
    }
    for (let i = 0; i < ifs.length; i++) {
        const element = ifs[i];
        lines[element] = lines[element].replace(' shape="box" ]', ' shape="diamond" ]');
    }
}

function changeLabelIf(index) {
    if (lines[index].includes('"true"')) {
        lines[index] = lines[index].replace('"true"', 'T');
        pushIfsIndex(lines[index]);
    }
    else if (lines[index].includes('"false"')) {
        lines[index] = lines[index].replace('"false"', 'F');
        pushIfsIndex(lines[index]);
    }
}

function pushIfsIndex(line) {
    let str = line.split(' ');
    str[0] = str[0].substring(1);
    ifs.push(str[0]);
    idIFS[str[0]] = 'its if';
}

function removeEntryExit() {
    lastN = getLastN();
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('n0'))
            lines[i] = -1;
        else if (lines[i].includes('n' + lastN))
            lines[i] = -1;
    }
}

function getLastN() {
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('->'))
            return i - 1;
    }
}

function removeLetVar() {
    for (let index = 0; index < lines.length; index++) {
        if (lines[index] != -1) {
            clearVarAndLet(index);
            if (lines[index].includes(';'))
                lines[index] = lines[index].replace(';', '');
        }
    }
}

function clearVarAndLet(index) {
    if (lines[index].includes('let '))
        lines[index] = lines[index].replace('let ', '');
    else if (lines[index].includes('var '))
        lines[index] = lines[index].replace('var ', '');
}

function unionLines() {
    fillTypeOfShape();
    fillNumPointer();
    clearLines();
    fillLables();
    merge();
    clearLines();
}

function fillTypeOfShape() {
    for (let index = 1; index < lastN; index++)
        typeShape[index] = 'box';
    for (let i = 0; i < ifs.length; i++)
        typeShape[ifs[i]] = 'diamond';
}

function fillNumPointer() {
    numOfPointers = [];
    for (let i = 0; i < lastN; i++)
        numOfPointers[i] = 0;
    for (let index = 0; index < lines.length; index++)
        if (lines[index] != -1 && lines[index].includes(' -> ')) {
            let pointerTo = PointerTo(lines[index]);
            numOfPointers[pointerTo] = numOfPointers[pointerTo] + 1;
        }
}

function fillLables() {
    for (let i = 0; i < lastN - 1; i++) {
        let label = lines[i].split('"')[1];
        labels[i + 1] = label;
    }
}

function PointerTo(line) {
    let pointerTo = line.split(' ')[2];
    pointerTo = pointerTo.substring(1);
    return pointerTo;
}

function Pointer(line) {
    let pointer = line.split(' ')[0];
    pointer = pointer.substring(1);
    return pointer;
}

function clearLines() {
    let lineTemp = [];
    for (let i = 0; i < lines.length; i++) {
        const element = lines[i];
        if (element != -1 && element.includes('['))
            lineTemp.push(element);
    }
    lines = [];
    lines = lineTemp;
}

function merge() {
    let toDelete = [];
    for (let i = lastN - 1; i < lines.length; i++) {
        const element = lines[i];
        let indexPointer = Pointer(element);
        let indexPointerTo = PointerTo(element);
        if (twoBox(indexPointer, indexPointerTo)) {
            if (notRetAndOne(indexPointerTo)) {
                toDelete.push(indexPointer);
                let label = labels[indexPointer] + '\n' + labels[indexPointerTo];
                lines[indexPointerTo - 1] = lines[indexPointerTo - 1].replace(labels[indexPointerTo], label);
                labels[indexPointerTo] = label;
                changeThePointer(indexPointer, indexPointerTo);
                fillNumPointer();
            }
        }
    }
    deleteNodes(toDelete);
}

function twoBox(indexPointer, indexPointerTo) {
    return (typeShape[indexPointer] == 'box' && typeShape[indexPointerTo] == 'box');
}

function notRetAndOne(indexPointerTo) {
    return (numOfPointers[indexPointerTo] == 1 && labels[indexPointerTo].includes('return') == false);
}

function changeThePointer(indexPointer, indexPointerTo) {
    for (let i = lastN - 1; i < lines.length; i++) {
        const element = lines[i];
        let pointerTo = PointerTo(element);
        if (pointerTo == indexPointer)
            lines[i] = lines[i].replace('n' + indexPointer, 'n' + indexPointerTo);
    }
}

function deleteNodes(toDelete) {
    for (let i = 0; i < toDelete.length; i++) {
        const element = toDelete[i];
        for (let j = 0; j < lines.length; j++) {
            if (lines[j] != -1) {
                let pointer = Pointer(lines[j]);
                if (pointer == element) {
                    lines[j] = -1;
                    typeShape[pointer] = -1;
                    labels[pointer] = -1;
                    numOfPointers[pointer] = -1;
                }
            }
        }
    }
}

function numbering() {
    let number = 1;
    let indexRet;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(' -> ') == false) {
            let label = lines[i].split('"')[1];
            if (!label.includes('return')) {
                lines[i] = lines[i].replace(label, '(' + number + ')' + '\n' + label);
                number++;
            }
            else
                indexRet = i;
        }

    }
    if (indexRet) {
        let labelRet = lines[indexRet].split('"')[1];
        lines[indexRet] = lines[indexRet].replace(labelRet, '(' + number + ')' + '\n' + labelRet);
    }
}

function fillPointers() {
    let pointer;
    let pointerTo;
    for (let i = 0; i < lines.length; i++) {
        const element = lines[i];
        if (element.includes(' -> ')) {
            pointer = Pointer(element);
            pointerTo = PointerTo(element);
            if (element.includes('label=T'))
                pointersIF[pointer + 't'] = pointerTo;
            else if (element.includes('label=F'))
                pointersIF[pointer + 'f'] = pointerTo;
            else
                pointersArray[pointer] = PointerTo(element);
        }
    }
}

function getIndexColor() {
    let i = 1;
    let next = true;
    let boolCondition = false;
    while (labels[i] == -1)
        i++;
    while (next) {
        toColor[i] = true;
        if (typeShape[i] == 'box') {
            updateVariable(labels[i]);
            i = getNext(i, 'box', boolCondition);
        }
        else {
            boolCondition = getValueOfCondition(labels[i]);
            i = getNext(i, 'diamond', boolCondition);
        }
        if (i == undefined)
            next = false;
    }
}

function getNext(i, shape, boolCondition) {
    if (shape == 'box')
        return pointersArray[i];
    else if (boolCondition)
        return pointersIF[i + 't'];
    return pointersIF[i + 'f'];
}

function getValueOfCondition(condition) {
    let ans = '';
    let condArray = (condition + '').split(' ');
    for (let index = 0; index < condArray.length; index++)
        ans = ans + getValueFromTable(condArray[index]);
    while (ans.includes('  '))
        ans = ans.replace('  ', ' ');
    return eval(ans);
}

function updateVariable(labels) {
    let lablesArray = labels.split('\n');
    for (let i = 0; i < lablesArray.length; i++) {
        const element = lablesArray[i];
        if (element.includes('return') == false) {
            let valueAndName = element.split(' = ');
            if (element.includes('++') == false)
                if (isValueArray(valueAndName[1]))
                    insertToDictionaryArray(valueAndName[0], valueAndName[1]);
                else
                    addToDictionary(valueAndName[0], valueAndName[1]);
            else
                addToDictionary(element.replace('++', ''), element.replace('++', '') + ' + 1');
        }
    }
}

function isValueArray(value) {
    value = value + '';
    return (value.indexOf('[') == 0 && value.indexOf(']') == value.length - 1);
}

function insertToDictionaryArray(name, values) {
    addToDictionary(name, values);
    values = values.substring(values.indexOf('[') + 1, values.indexOf(']'));
    let valuesArray = values.split(',');
    for (let i = 0; i < valuesArray.length; i++)
        addToDictionary(name + '[' + i + ']', valuesArray[i]);
}

function addToDictionary(name, value) {
    value = calculateValue(value);
    if (isValueArray(value))
        insertToDictionaryArray(name, value);
    inputAndVariable[name] = value;
}

function calculateValue(value) {
    let ans = '';
    let valueArray = (value + '').split(' ');
    for (let j = 0; j < valueArray.length; j++)
        ans = ans + getValueFromTable(valueArray[j]);
    return ans;
}

function getValueFromTable(element) {
    element = '' + element;
    if (inputAndVariable[element])
        return inputAndVariable[element];
    else return ' ' + element + ' ';
}

function changeColor() {
    for (let i = 1; i < toColor.length; i++)
        if (toColor[i] == true)
            changeColor1(i);
}

function changeColor1(i) {
    for (let j = 0; j < lines.length; j++)
        if (lines[j].includes(' -> ') == false) {
            let pointer = Pointer(lines[j]);
            if (pointer == i)
                lines[j] = lines[j].replace(' ]', ',style="filled" , color=green ]');
        }
}

function getFullLines() {
    let ans = '';
    for (let index = 0; index < lines.length; index++) {
        const element = lines[index];
        ans = ans + element + '\n';
    }
    return ans;
}

/*clear*/
function clearCFG() {
    ifs = [];
    idIFS = [];
    numOfPointers = [];
    pointersArray = [];
    typeShape = [];
    labels = [];
    lastN;
    lines = [];
    toColor = [];
    inputAndVariable = [];
    pointersIF = [];
}

function getLines() {
    return lines;
}

function getTypeOfShape() {
    return typeShape;
}

function getColors() {
    return toColor;
}

function getLabels() {
    return labels;
}

function getPointers() {
    return pointersArray;
}

function getNumOfPointers() {
    return numOfPointers;
}

function getDictionary() {
    return inputAndVariable;
}

export { createBasicGraph };
export { clearCFG };
export { getLines };
export { getTypeOfShape };
export { getColors };
export { getLabels };
export { getPointers };
export { getNumOfPointers };
export { getDictionary };




