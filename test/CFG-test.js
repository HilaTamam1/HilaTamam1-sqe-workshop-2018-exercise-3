import assert from 'assert';
import { parseCode } from '../src/js/code-analyzer';
import { clear } from '../src/js/parse';
import { clearSymbolic } from '../src/js/symbolic-substitution';
import { clearCFG } from '../src/js/CFG';
import { createBasicGraph } from '../src/js/CFG';
import { getLines } from '../src/js/CFG';
import { getTypeOfShape } from '../src/js/CFG';
import { getColors } from '../src/js/CFG';
import { getLabels } from '../src/js/CFG';
import { getPointers } from '../src/js/CFG';
import { getNumOfPointers } from '../src/js/CFG';
import { getDictionary } from '../src/js/CFG';

describe('final graph 1', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y, z){
        let a = x + 1;
        var b = a + y;
        let c = 0;
        
        if (b < z) {
            c = c + 5;
        } else if (b < z * 2) {
            c = c + x + 5;
        } else {
            c = c + z + 5;
        }
        
        return c;
    }
    `
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    idInput.push('z');

    let changedGraph = createBasicGraph(code, parsedCode, '1, 2, 3', idInput)
    var liness = getLines();
    it('lines1', () => {
        assert.equal(liness[0], `n3 [label="(1)\na = x + 1\nb = a + y\nc = 0" shape="box",style="filled" , color=green ]`);
    });
});

describe('final graph 2', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y, z, arr) {

        while (arr[2]) {
            if (y > 0) {
                y = arr[1] + 1
                if (y > 2) {
                    x = 3;
                }
            }
            else {
                x = x + ' hila';
            }
            let c = arr[1];
            z = c * 2;
            arr[2] = false;
        }
        return z;
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    idInput.push('z');
    idInput.push('arr');
    let changedGraph = createBasicGraph(code, parsedCode, `'hi', 5, 2, [1,2,true]`, idInput)
    var liness = getLines();
    it('lines1', () => {
        assert.equal(liness[0], `n1 [label="(1)\narr[2]" shape="diamond",style="filled" , color=green ]`);
    });
});

describe('labels graph 3', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y) {
        x++;
        if (x > 1) {
            y = y + 5;
        } else {
            y = y + 10;
        }
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2`, idInput)
    let labels = getLabels();
    it('label1', () => {
        assert.equal(labels[1], "x++");
    });
    it('label2', () => {
        assert.equal(labels[2], "x > 1");
    });
    it('label3', () => {
        assert.equal(labels[3], "y = y + 5");
    });
    it('label4', () => {
        assert.equal(labels[4], "y = y + 10");
    });
});

describe('final graph 3', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y) {
        x++;
        if (x > 1) {
            y = y + 5;
        } else {
            y = y + 10;
        }
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2`, idInput)
    let lines = getLines();
    it('line 1', () => {
        assert.equal(lines[0], `n1 [label="(1)\nx++" shape="box",style="filled" , color=green ]`);
    });
    it('line 2', () => {
        assert.equal(lines[1], `n2 [label="(2)\nx > 1" shape="diamond",style="filled" , color=green ]`);
    });
    it('line 3', () => {
        assert.equal(lines[2], `n3 [label="(3)\ny = y + 5" shape="box",style="filled" , color=green ]`);
    });
    it('line 4', () => {
        assert.equal(lines[3], `n4 [label="(4)\ny = y + 10" shape="box" ]`);
    });
    it('line 5', () => {
        assert.equal(lines[4], "n1 -> n2 []");
    });
    it('line 6', () => {
        assert.equal(lines[5], "n2 -> n3 [label=T]");
    });
    it('line 7', () => {
        assert.equal(lines[6], "n2 -> n4 [label=F]");
    });
});

describe('type graph 3', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y) {
        x++;
        if (x > 1) {
            y = y + 5;
        } else {
            y = y + 10;
        }
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2`, idInput)
    let types = getTypeOfShape();
    it('type 1', () => {
        assert.equal(types[1], 'box');
    });
    it('type 2', () => {
        assert.equal(types[2], 'diamond');
    });
    it('type 3', () => {
        assert.equal(types[3], 'box');
    });
    it('type 4', () => {
        assert.equal(types[4], "box");
    });
});

describe('color graph 3', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y) {
        x++;
        if (x > 1) {
            y = y + 5;
        } else {
            y = y + 10;
        }
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2`, idInput)
    let colors = getColors();
    it('type 1', () => {
        assert.equal(colors[1], true);
    });
    it('type 2', () => {
        assert.equal(colors[2], true);
    });
    it('type 3', () => {
        assert.equal(colors[3], true);
    });

});

describe('dictionary graph 3', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y) {
        x++;
        if (x > 1) {
            y = y + 5;
        } else {
            y = y + 10;
        }
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2`, idInput)
    let dic = getDictionary();
    it('x', () => {
        assert.equal(dic['x'], "1 +  1 ");
    });
    it('y', () => {
        assert.equal(dic['y'], "2 +  5 ");
    });

});

describe('pointers graph 3', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y) {
        x++;
        if (x > 1) {
            y = y + 5;
        } else {
            y = y + 10;
        }
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2`, idInput)
    let pointers = getPointers();
    it('p1', () => {
        assert.equal(pointers['1'], 2);
    });


});

describe('pointers graph 3', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y) {
        x++;
        if (x > 1) {
            y = y + 5;
        } else {
            y = y + 10;
        }
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2`, idInput)
    let numPointers = getNumOfPointers();
    it('--', () => {
        assert.equal(numPointers[0], 0);
    });
    it('p1', () => {
        assert.equal(numPointers[1], 0);
    });
    it('p2', () => {
        assert.equal(numPointers[2], 1);
    });

    it('p3', () => {
        assert.equal(numPointers[3], 1);
    });
    it('p4', () => {
        assert.equal(numPointers[4], 1);
    });
});

describe('color graph 4', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y, z) {
        let a = x + 1;
        let b = y;
        let c = 0;
    
        while (b == 'cat') {
            c = a + b;
            z = c * 2;
            a++;
            b = 'blue'
        }
    
        return z;
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    idInput.push('z');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 'cat', 2`, idInput)
    let colors = getColors();
    it('color 3', () => {
        assert.equal(colors[3], true);
    });
    it('color 4 ', () => {
        assert.equal(colors[4], true);
    });
    it('color 8', () => {
        assert.equal(colors[8], true);
    });
    it('color 9', () => {
        assert.equal(colors[9], true);
    });
});

describe('color graph 5', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y, z) {
        while (z > 2) {
            while (y > z + 2) {
                x = 2;
            }
        z = z - 1;
        }
        return x;
    }`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    idInput.push('z');
    let changedGraph = createBasicGraph(code, parsedCode, `5, 5, 5`, idInput)
    let colors = getColors();
    it('color 1', () => {
        assert.equal(colors[1], true);
    });
    it('color 2', () => {
        assert.equal(colors[2], true);
    });
    it('color 5', () => {
        assert.equal(colors[5], true);
    });
    it('color 4 ', () => {
        assert.equal(colors[4], true);
    });
});

describe('color graph 6', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y, z) {
        let arr = [x + 7, 0, 5 + y];
    
        while (arr[2] < z) {
            if (arr[1] == 0) {
                y = arr[1] + 1;
            }
            else {
                x = 8;
            }
            c = arr[2] + arr[0];
            z = c * 5;
        }
    
        return y;
    };`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    idInput.push('z');
    let changedGraph = createBasicGraph(code, parsedCode, `1, 2, 0`, idInput)
    let colors = getColors();
    it('color 1', () => {
        assert.equal(colors[1], true);
    });
    it('color 2', () => {
        assert.equal(colors[2], true);
    });
    it('color 8 ', () => {
        assert.equal(colors[8], true);
    });
});

describe('color graph 7', () => {
    clear();
    clearSymbolic();
    clearCFG();
    var code = `function foo(x, y, z) {
        let arr = y;
    
        while (arr[2] < z) {
            if (arr[1] == 0) {
                y = arr[1] + 1;
            }
            else {
                x = 8;
            }
            c = arr[2] + arr[0];
            z = c * 5;
        }
    
        return y;
    };`
    var parsedCode = parseCode(code);
    var idInput = [];
    idInput.push('x');
    idInput.push('y');
    idInput.push('z');
    let changedGraph = createBasicGraph(code, parsedCode, `1, [1,2,3], 0`, idInput)
    let colors = getColors();
    it('color 1', () => {
        assert.equal(colors[1], true);
    });
    it('color 2', () => {
        assert.equal(colors[2], true);
    });
    it('color 8 ', () => {
        assert.equal(colors[8], true);
    });
});
