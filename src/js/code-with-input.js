let conditions = [];

function getValueCondition(newCode, idInput, inputsLine, countParams) {
    conditions = [];
    let conditionWithInputs = [];
    let inputAfterSplit = inputsLine.split(', ');
    pushCondition(newCode);
    for (let index = 0; index < conditions.length; index++) {
        for (let i = 0; i < countParams; i++) {
            if (inputAfterSplit[i].includes('[') == false) {
                while (conditions[index].includes(idInput[i]))
                    conditions[index] = conditions[index].replace(idInput[i], inputAfterSplit[i]);
            }
            else {
                let elementsArray = getElementsArray(inputAfterSplit[i]);
                replaceArray(elementsArray, index, i, idInput);
            }
        }
        conditionWithInputs.push(checkCond(conditions[index]));
    }
    return conditionWithInputs;
}

function pushCondition(newCode) {
    let lines = newCode.split('\n');
    for (let index = 0; index < lines.length; index++) {
        const element = lines[index];
        if (element.includes('if') || element.includes('else if')) {
            conditions.push(element);
        }
    }
}

function getElementsArray(inputElement) {
    let leftIndex = inputElement.indexOf('[');
    let rightIndex = inputElement.indexOf(']');
    let elementsArray = inputElement.substring(leftIndex + 1, rightIndex);
    return elementsArray;
}

function replaceArray(elementsArray, index, i, idInput) {
    let values = elementsArray.split(',');
    for (let j = 0; j < values.length; j++) {
        while (conditions[index].includes(idInput[i] + '[' + j + ']')) {
            conditions[index] = conditions[index].replace(idInput[i] + '[' + j + ']', values[j]);
        }
    }
}
function checkCond(condition) {
    let cond = condition.substring(condition.indexOf('(') + 1, condition.indexOf(')'));
    return eval(cond);
}

export { getValueCondition };