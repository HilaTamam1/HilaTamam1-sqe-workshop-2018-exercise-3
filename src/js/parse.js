import * as esprima from 'esprima';

let lineNumber = 1;
var infoTable = [];
let flag = false;
var forBool = false;
let paramsName=[];

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, { loc: true });
};

function getParamsName(){
    return paramsName;
}
//The main function- checks the type of the element and send to other functions
function Parsing(parseCode) {
    if (parseCode.type == 'BlockStatement')
        Parsing(parseCode.body);
    for (let i = 0; i < parseCode.length; i++) {
        const element = parseCode[i];
        checkType(element);
        if (flag == true)
            flag = false;
        if (element.alternate)
            alternateElem(element);
    }
    return infoTable;
}

// types
function checkType(element) {
    if (element.type == 'FunctionDeclaration')
        parseFunction(element);
    else if (element.type == 'VariableDeclaration')
        parseVariableDeclaration(element);
    else
        OtherTypes(element);

}

// types
function OtherTypes(element) {
    if (element.type == 'ExpressionStatement')
        parseExpressionStatement(element.expression);
    else if (element.type == 'IfStatement' && flag == false)
        parseIfStatement(element);
    else
        OtherTypes1(element);
}

// types
function OtherTypes1(element) {
    if (element.type == 'ReturnStatement')
        parseReturnStatement(element);
    else if (element.type == 'WhileStatement')
        parseWhileStatement(element);
    else if (element.type == 'ForStatement')
        parseForStatement(element);
}

//initialization
function clear() {
    infoTable = [];
    lineNumber = 1;
    flag = false;
    forBool = false;
}

//parsing of function element
function parseFunction(functionElement) {
    pushInTable(functionElement);
    for (let index = 0; index < functionElement.params.length; index++) {
        const paramElement = functionElement.params[index];
        var lineTable1 = {};
        lineTable1.Line = lineNumber;
        lineTable1.Type = 'variable declaration';
        lineTable1.Name = paramElement.name;
        lineTable1.Start = paramElement.loc.start.line;
        lineTable1.End = paramElement.loc.end.line;
        infoTable.push(lineTable1);
        paramsName.push(paramElement.name);
    }
    lineNumber++;
    Parsing(functionElement.body);
}

function pushInTable(functionElement) {
    var lineTable = {};
    lineTable.Line = lineNumber;
    lineTable.Type = 'function declaration';
    lineTable.Name = functionElement.id.name;
    lineTable.Start = functionElement.body.loc.start.line;
    lineTable.End = functionElement.body.loc.end.line;
    infoTable.push(lineTable);
}

//parsing of variable declaration element
function parseVariableDeclaration(variableDeclarationElement) {
    for (let index = 0; index < variableDeclarationElement.declarations.length; index++) {
        const varDecElement = variableDeclarationElement.declarations[index];
        var lineTable = {};
        lineTable.Line = lineNumber;
        lineTable.Type = 'variable declaration';
        lineTable.Name = varDecElement.id.name;
        lineTable.Start = variableDeclarationElement.loc.start.line;
        lineTable.End = variableDeclarationElement.loc.end.line;
        if (varDecElement.init)
            lineTable.Value = (parseExpressionStatementRec(varDecElement.init));
        // lineTable.Value = checkParentheses(parseExpressionStatementRec(varDecElement.init));
        if (!forBool)
            infoTable.push(lineTable);
    }
    if (!forBool)
        lineNumber++;
    return lineTable;
}

//parsing of expression statement
function parseExpressionStatement(expressionStatementElement) {
    var lineTable = {};
    lineTable.Line = lineNumber;
    lineTable.Start = expressionStatementElement.loc.start.line;
    lineTable.End = expressionStatementElement.loc.start.line;
    lineTable.Type = 'assignment expression';
    if (expressionStatementElement.type == 'UpdateExpression') {
        lineTable.update = true;
        lineTable.Name = expressionStatementElement.argument.name;
        lineTable.Value = ValueEx(expressionStatementElement);
    }
    else {
        lineTable.Name = NameEx(expressionStatementElement);
        lineTable.Value = (parseExpressionStatementRec(expressionStatementElement.right));
        // lineTable.Value = checkParentheses(parseExpressionStatementRec(expressionStatementElement.right));
    }
    lineTablePush(lineTable);
    return lineTable;
}

function lineTablePush(lineTable) {
    if (!forBool) {
        infoTable.push(lineTable);
        lineNumber++;
    }
}

//return the name of the expression statement
function NameEx(expressionStatementElement) {
    if (expressionStatementElement.left.type == 'Identifier')
        return expressionStatementElement.left.name;
    else
        return (parseExpressionStatementRec(expressionStatementElement.left));
    // return checkParentheses(parseExpressionStatementRec(expressionStatementElement.left));
}

//return the value of the expression statement
function ValueEx(expressionStatementElement) {
    if (expressionStatementElement.prefix)
        return expressionStatementElement.operator + expressionStatementElement.argument.name;
    else
        return expressionStatementElement.argument.name + expressionStatementElement.operator;
}

//parsing of expression statement
function parseExpressionStatementRec(expressionStatementElement) {
    if (expressionStatementElement.type == 'BinaryExpression')
        return parseExpressionStatementRec(expressionStatementElement.left) + ' ' + expressionStatementElement.operator + ' ' + (parseExpressionStatementRec(expressionStatementElement.right));
    if (expressionStatementElement.type == 'Literal')
        return literal(expressionStatementElement);
    if (expressionStatementElement.type == 'Identifier')
        return expressionStatementElement.name;
    return parseExpressionStatementRec2(expressionStatementElement);

}

function literal(expressionStatementElement) {
    if (expressionStatementElement.raw && expressionStatementElement.value != true && expressionStatementElement.value != false)
        return expressionStatementElement.raw;
    return expressionStatementElement.value;
}

function member(expressionStatementElement) {
    if (parseExpressionStatementRec(expressionStatementElement.property) == 'length')
        // if (checkParentheses(parseExpressionStatementRec(expressionStatementElement.property)) == 'length')
        return expressionStatementElement.object.name + '.length';
    return expressionStatementElement.object.name + '[' + (parseExpressionStatementRec(expressionStatementElement.property)) + ']';
    // return expressionStatementElement.object.name + '[' + checkParentheses(parseExpressionStatementRec(expressionStatementElement.property)) + ']';
}

function parseExpressionStatementRec2(expressionStatementElement) {
    if (expressionStatementElement.type == 'ArrayExpression')
        return '[' + arrayAxpressionValue(expressionStatementElement) + ']';
    if (expressionStatementElement.type == 'MemberExpression')
        return member(expressionStatementElement);
    return unaryAndUpdate(expressionStatementElement);
}

function arrayAxpressionValue(arrayExpressionElement) {
    let value = '';
    // if (arrayExpressionElement.elements) {
    value = parseExpressionStatementRec(arrayExpressionElement.elements[0]);
    for (let index = 1; index < arrayExpressionElement.elements.length; index++) {
        const element = arrayExpressionElement.elements[index];
        value = value + ',' + parseExpressionStatementRec(element);
    }
    // }
    return value;
}

//parsing of expression statement2
function unaryAndUpdate(expressionStatementElement) {
    if (expressionStatementElement.type == 'UnaryExpression')
        return expressionStatementElement.operator + (parseExpressionStatementRec(expressionStatementElement.argument));
    // return expressionStatementElement.operator + checkParentheses(parseExpressionStatementRec(expressionStatementElement.argument));
    // if (expressionStatementElement.type == 'UpdateExpression') {
    if (expressionStatementElement.prefix)
        return expressionStatementElement.operator + expressionStatementElement.argument.name;
    else
        return expressionStatementElement.argument.name + expressionStatementElement.operator;
}

//parsing of while statement
function parseWhileStatement(whileStatementElement) {
    var lineTable = {};
    lineTable.Line = lineNumber;
    lineTable.Type = 'while statement';
    lineTable.Condition = (parseExpressionStatementRec(whileStatementElement.test));
    // lineTable.Condition = checkParentheses(parseExpressionStatementRec(whileStatementElement.test));
    lineTable.Start = whileStatementElement.loc.start.line;
    lineTable.End = whileStatementElement.loc.end.line;
    infoTable.push(lineTable);
    lineNumber++;
    Parsing(whileStatementElement.body);
}

//parsing of if statement
function parseIfStatement(ifStatementElement) {
    var lineTable = {};
    lineTable.Line = lineNumber;
    lineTable.Type = 'if statement';
    lineTable.Start = ifStatementElement.loc.start.line;
    if (ifStatementElement.alternate)
        lineTable.End = ifStatementElement.alternate.loc.start.line;
    else
        lineTable.End = ifStatementElement.loc.end.line;
    lineTable.Condition = (parseExpressionStatementRec(ifStatementElement.test));
    // lineTable.Condition = checkParentheses(parseExpressionStatementRec(ifStatementElement.test));
    infoTable.push(lineTable);
    lineNumber++;
    checkIfConsequent(ifStatementElement.consequent);
}

//consequent of if statement
function checkIfConsequent(element) {
    if (element.type == 'BlockStatement')
        Parsing(element);
    else {
        var array = [];
        array.push(element);
        Parsing(array);
    }

}

//alternate of if statement
function alternateElem(element) {
    var alternateElement = JSON.parse(JSON.stringify(element.alternate));
    if (alternateElement.type == 'IfStatement') {
        var lineTable = {};
        lineTable.Line = lineNumber;
        lineTable.Start = alternateElement.loc.start.line;
        lineTable.Type = 'else if statement';
        lineTable.Condition = (parseExpressionStatementRec(alternateElement.test));
        // lineTable.Condition = checkParentheses(parseExpressionStatementRec(alternateElement.test));
        if (alternateElement.alternate)
            lineTable.End = alternateElement.alternate.loc.start.line;
        else
            lineTable.End = alternateElement.loc.end.line;
        alternateElem1(lineTable, alternateElement);
    }
    else {
        alternateElem2(alternateElement);
    }
    alternateType(alternateElement);
}

function alternateElem1(lineTable, alternateElement) {
    infoTable.push(lineTable);
    lineNumber++;
    checkIfConsequent(alternateElement.consequent);
    flag = true;
}

function alternateElem2(alternateElement) {
    var lineTable = {};
    lineTable.Line = lineNumber;
    lineTable.Start = alternateElement.loc.start.line;
    lineTable.End = alternateElement.loc.end.line;
    lineTable.Type = 'else statement';
    infoTable.push(lineTable);
}

function alternateType(alternateElement) {
    if (alternateElement.type == 'BlockStatement')
        Parsing(alternateElement);
    else
        Parsing([alternateElement]);
}

//parsing of return statement
function parseReturnStatement(returnStatementElement) {
    var lineTable = {};
    lineTable.Line = lineNumber;
    lineTable.Start = returnStatementElement.loc.start.line;
    lineTable.End = returnStatementElement.loc.end.line;
    lineTable.Type = 'return statement';
    lineTable.Value = (parseExpressionStatementRec(returnStatementElement.argument));
    // lineTable.Value = checkParentheses(parseExpressionStatementRec(returnStatementElement.argument));
    infoTable.push(lineTable);
    lineNumber++;
}

//parsing of for statement
function parseForStatement(forStatementElement) {
    forBool = true;
    var lineTable = {};
    lineTable.Line = lineNumber;
    lineTable.Type = 'for statement';
    var init = checkIfExpressionOrVariable(forStatementElement.init);
    var update = checkIfExpressionOrVariable(forStatementElement.update);
    lineTable.Condition = init + ' ; ' + (parseExpressionStatementRec(forStatementElement.test)) + ' ; ' + update;
    // lineTable.Condition = init + ' ; ' + checkParentheses(parseExpressionStatementRec(forStatementElement.test)) + ' ; ' + update;
    infoTable.push(lineTable);
    forBool = false;
    lineNumber++;
    Parsing(forStatementElement.body);

}

//return the value of the expression
function checkIfExpressionOrVariable(element) {
    if (element.type == 'VariableDeclaration') {
        var variable = parseVariableDeclaration(element);
        return variable.Name + ' = ' + variable.Value;
    }
    var expression = parseExpressionStatement(element);
    if (expression.update)
        return expression.Value;
    return expression.Name + ' = ' + expression.Value;
}

export { Parsing };
export { clear };
export { parseCode };
export { getParamsName };


// //check if there is Parentheses
// function checkParentheses(exRec) {
//     var str = '' + exRec;
//     if (str.substring(0, 1) == '(') {
//         var strSub = str.substring(1, str.length - 1);
//         return strSub;
//     }
//     return exRec;
// }