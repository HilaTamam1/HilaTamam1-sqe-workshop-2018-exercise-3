import assert from 'assert';
import { Parsing } from '../src/js/parse';
import { parseCode } from '../src/js/parse';
import { clear } from '../src/js/parse';
import { clearSymbolic } from '../src/js/symbolic-substitution';
import { getLines } from '../src/js/symbolic-substitution';
import { getNumParams } from '../src/js/symbolic-substitution';
import { getIdInput } from '../src/js/symbolic-substitution';
import { symbolicSub } from '../src/js/symbolic-substitution';
import { getValueCondition } from '../src/js/code-with-input';


describe('Start and End', () => {
    clearSymbolic();
    clear();
    var elementTest = parseCode(`function foo(x, y, z){

        if (x < z) {
            return x + y + z + 1;
        } else if (x < z * 2) {
            return x + y + z + 2;
        } else {
            return x + y + z + 3;
        }
    }
    `);
    var infoTable = Parsing(elementTest.body);
    it('function start', () => {
        assert.equal(infoTable[0].Start, 1);
    });
    it('function end', () => {
        assert.equal(infoTable[0].End, 10);
    });
    it('if start', () => {
        assert.equal(infoTable[4].Start, 3);
    });
    it('if end', () => {
        assert.equal(infoTable[4].End, 5);
    });
    it('else if start', () => {
        assert.equal(infoTable[6].Start, 5);
    });
    it('else if end', () => {
        assert.equal(infoTable[6].End, 7);
    });
});

describe('Line after simbolic substitution code 1', () => {
    clearSymbolic();
    clear();
    var code = `function foo(x, y, z){
        let a = x + 1;
        let b = a + y;
        let c = 0;

        if (b < z) {
            c = c + 5;
            return x + y + z + c;
        } else if (b < z * 2) {
            c = c + x + 5;
            return x + y + z + c;
        } else {
            c = c + z + 5;
            return x + y + z + c;
        }
    }`
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var inputsId = getIdInput();
    var conditionWithValue = getValueCondition(codeSimbolic, inputsId, '1, 2, 3', 3);

    it('params1', () => {
        assert.equal(inputsId[0], 'x');
    });
    it('params2', () => {
        assert.equal(inputsId[1], 'y');
    });
    it('params3', () => {
        assert.equal(inputsId[2], 'z');
    });
    it('line 1 ', () => {
        assert.equal(lines[0], 'function foo(x, y, z){');
    });
    it('line 2 ', () => {
        assert.equal(lines[1], '        if ( x  +  1  +  y  <  z ) {');
    });
    it('line 3 ', () => {
        assert.equal(lines[2], '            return  x  +  y  +  z  +  0  +  5 ;');
    });
    it('line 4 ', () => {
        assert.equal(lines[3], '        } else if ( x  +  1  +  y  <  z  *  2 ) {');
    });
    it('line 5 ', () => {
        assert.equal(lines[4], '            return  x  +  y  +  z  +  0  +  x  +  5 ;');
    });
    it('line 6 ', () => {
        assert.equal(lines[5], '        } else {');
    });
    it('line 7 ', () => {
        assert.equal(lines[6], '            return  x  +  y  +  z  +  0  +  z  +  5 ;');
    });
    it('line 8 ', () => {
        assert.equal(lines[7], '        }');
    });
    it('line 9 ', () => {
        assert.equal(lines[8], '    }');
    });
    it('condition 1', () => {
        assert.equal(conditionWithValue[0], false);
    });
    it('condition 2', () => {
        assert.equal(conditionWithValue[1], true);
    });

});

describe('Line after simbolic substitution code 2', () => {
    clearSymbolic();
    clear();
    var code = `function foo(x, y, z){
        let a = x + 1;
        let b = a + y;
        let c = 0;

        while (a < z) {
            c = a + b;
            z = c * 2;
        }

        return z;
    }
    `
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);

    it('line 1 ', () => {
        assert.equal(lines[0], 'function foo(x, y, z){');
    });
    it('line 2 ', () => {
        assert.equal(lines[1], '        while ( x  +  1  <  z ) {');
    });
    it('line 3 ', () => {
        assert.equal(lines[2], '            z = ( x  +  1  +  x  +  1  +  y ) *  2 ;');
    });
    it('line 4 ', () => {
        assert.equal(lines[3], '        }');
    });
    it('line 5 ', () => {
        assert.equal(lines[4], '        return  z ;');
    });
    it('line 6 ', () => {
        assert.equal(lines[5], '    }');
    });
});

describe('Line after simbolic substitution code 3', () => {
    clearSymbolic();
    clear();
    var code = `function  foo (x,y,z,arr){

        while(arr[2]){
          if ( y>0 ){
              y=arr[1]+1
              if( y>2){
                 x=3;
              }
          }
          else{
              x=x+' hila';
          }
          let c= arr[1];
          z= c*2;
       }
       
       return z;
    }
    
    `
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var inputsId = getIdInput();
    var conditionWithValue = getValueCondition(codeSimbolic, inputsId, 'hi, 5, 2, [1,2,true]', 4);

    it('condition 1', () => {
        assert.equal(conditionWithValue[0], true);
    });
    it('condition 2', () => {
        assert.equal(conditionWithValue[1], true);
    });
    it('line 1 ', () => {
        assert.equal(lines[0], "function  foo (x,y,z,arr){");
    });
    it('line 2 ', () => {
        assert.equal(lines[1], "        while( arr[2] ) {");
    });
    it('line 3 ', () => {
        assert.equal(lines[2], "          if ( y  >  0 ) {");
    });
    it('line 4 ', () => {
        assert.equal(lines[3], "              y=  arr[1]  +  1 ;");
    });
    it('line 5 ', () => {
        assert.equal(lines[4], "              if( arr[1]  +  1  >  2 ) {");
    });
    it('line 6 ', () => {
        assert.equal(lines[5], "                 x=  3 ;");
    });
    it('line 8', () => {
        assert.equal(lines[9], "              x=  x  +  '  hila' ;");
    });
    it('line 10 ', () => {
        assert.equal(lines[11], "          z= ( arr[1] ) *  2 ;");
    });
    it('line 12 ', () => {
        assert.equal(lines[13], "       return  z ;");
    });

});

describe('Line after simbolic substitution code 4', () => {
    clearSymbolic();
    clear();
    var code = `let c=9;
    function foo(x,y){
        let a=x+c;
        if(y<a){
          return a;
        }
        else{
          return y;
        }
    }`
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var numParams = getNumParams();
    // conditionWithValue = getValueCondition(code, getInputs(), inputsLine);
    it('num Params', () => {
        assert.equal(numParams, 2);
    });
    it('line 1 ', () => {
        assert.equal(lines[0], "    function foo(x,y){");
    });
    it('line 2 ', () => {
        assert.equal(lines[1], "        if( y  <  x  +  9 ) {");
    });
    it('line 3 ', () => {
        assert.equal(lines[2], "          return  x  +  9 ;");
    });
    it('line 4 ', () => {
        assert.equal(lines[3], "        }");
    });
    it('line 5 ', () => {
        assert.equal(lines[4], "        else{");
    });
    it('line 6 ', () => {
        assert.equal(lines[5], "          return  y ;");
    });
});

describe('Line after simbolic substitution code 5', () => {
    clearSymbolic();
    clear();

    var code = `function foo(x, y, z){
        let arr=[x+7 ,0 ,  5+y];

            while( arr[2] < z) {
                if( arr[1] == 0){
                   y=arr[1]+1;
                }
                else{
                   x=8;
                }
                c = arr[2] + arr[0];
                z = c * 5;
            }

            return y;
        };`;

    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var numParams = getNumParams();
    // conditionWithValue = getValueCondition(code, getInputs(), inputsLine);
    it('num Params', () => {
        assert.equal(numParams, 3);
    });
    it('line 1 ', () => {
        assert.equal(lines[0], "function foo(x, y, z){");
    });
    it('line 2 ', () => {
        assert.equal(lines[1], "            while( 5  +  y  <  z ) {");
    });
    it('line 3 ', () => {
        assert.equal(lines[2], "                if( 0  ==  0 ) {");
    });
    it('line 4 ', () => {
        assert.equal(lines[3], "                   y=  0  +  1 ;");
    });
    it('line 9 ', () => {
        assert.equal(lines[8], "                z = ( 5  +  y  +  x  +  7 ) *  5 ;");
    });
});

describe('Line after simbolic substitution code 6', () => {
    clearSymbolic();
    clear();

    var code = `function foo(x, y, z){
        let a = x;
        let b = x[0];
        let c = x[1];
        let d = x[2];
        if (c < d ) {
            y=x[0];
        } 
        return a;
    }`;

    //[1,2,3], 5, 10
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var numParams = getNumParams();
    // conditionWithValue = getValueCondition(code, getInputs(), inputsLine);
    it('num Params', () => {
        assert.equal(numParams, 3);
    });
    it('line 1 ', () => {
        assert.equal(lines[0], "function foo(x, y, z){");
    });
    it('line 2 ', () => {
        assert.equal(lines[1], "        if ( x[1]  <  x[2] ) {"
        );
    });
    it('line 3 ', () => {
        assert.equal(lines[2], "            y=  x[0] ;");
    });
    it('line 5 ', () => {
        assert.equal(lines[4], "        return  x ;");
    });
});

describe('Line after simbolic substitution code 7', () => {
    clearSymbolic();
    clear();
    var code = `let a=1;

    function foo(){
        return a;

    }
    a=a+7;`;
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var numParams = getNumParams();
    // conditionWithValue = getValueCondition(code, getInputs(), inputsLine);
    it('num Params', () => {
        assert.equal(numParams, 0);
    });
    it('line 1 ', () => {
        assert.equal(lines[0], "    function foo(){");
    });
    it('line 2 ', () => {
        assert.equal(lines[1], "        return  1  +  7 ;");
    });
});

describe('Line after simbolic substitution code 8', () => {
    clearSymbolic();
    clear();

    var code = `let aa = 1;
    let bb; 
    function foo(x, y, z){
        let a = x + 1;
        let b = a + y;
        let c = 0;

        while (a < z) {
            c = a + b;
            z = c * 2;
            z=d;
            bb=c;
        }

        return z;
    }
    let d = aa*5;
    d=d*d;`;

    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var numParams = getNumParams();
    // conditionWithValue = getValueCondition(code, getInputs(), inputsLine);
    it('num Params', () => {
        assert.equal(numParams, 3);
    });
    it('line 1 ', () => {
        assert.equal(lines[1], "        while ( x  +  1  <  z ) {");
    });
    it('line 2 ', () => {
        assert.equal(lines[2], "            z = ( x  +  1  +  x  +  1  +  y ) *  2 ;");
    });
    it('line 3 ', () => {
        assert.equal(lines[3], "            z= ( 1  *  5 ) *  1  *  5 ;");
    });
    it('line 4 ', () => {
        assert.equal(lines[4], "            bb=  x  +  1  +  x  +  1  +  y ;");
    });
    it('line 9 ', () => {
        assert.equal(lines[6], "        return  z ;");
    });
});

describe('Line after simbolic substitution code 9', () => {
    clearSymbolic();
    clear();

    var code = `function foo(x, y, z){
        let arr=[x+1 ,10 ,  x+y];

            while( arr[2] < z) {
                c = arr[2] + arr[1];
                z = arr[2] * 2 / arr[1];
            }

            return z;
        }`;

    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var numParams = getNumParams();
    // conditionWithValue = getValueCondition(code, getInputs(), inputsLine);
    it('num Params', () => {
        assert.equal(numParams, 3);
    });
    it('line 1 ', () => {
        assert.equal(lines[0], "function foo(x, y, z){");
    });
    it('line 2 ', () => {
        assert.equal(lines[1], "            while( x  +  y  <  z ) {");
    });
    it('line 3 ', () => {
        assert.equal(lines[2], "                z = (( x  +  y ) *  2 ) /  10 ;");
    });
    it('line 4 ', () => {
        assert.equal(lines[4], "            return  z ;");
    });
});

describe('Line after simbolic substitution code 10', () => {
    clearSymbolic();
    clear();

    var code = `function foo(x, y, z){
        let arr= [true, 'hi', x*y*z ];
        let c= true;
        let bool=arr[0];

            while( bool ) {
                if(c){
                   y=arr[2]+3;
                }
            }
            return y;
        };`;

    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var numParams = getNumParams();
    // conditionWithValue = getValueCondition(code, getInputs(), inputsLine);
    it('num Params', () => {
        assert.equal(numParams, 3);
    });
    it('line 1 ', () => {
        assert.equal(lines[1], "            while( true ) {");
    });
    it('line 2 ', () => {
        assert.equal(lines[2], "                if( true ) {");
    });
    it('line 3 ', () => {
        assert.equal(lines[3], "                   y= ( x  *  y ) *  z  +  3 ;");
    });
    it('line 5 ', () => {
        assert.equal(lines[6], "            return  y ;");
    });
});


describe('Line after simbolic substitution code 3', () => {
    clearSymbolic();
    clear();
    var code = `function foo(x, y, z) {
        let c = 0;
        if (y + z * z > 0) {
            c = c + 1;
        }
        return y*z*z;
    }`
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    var codeSimbolic = symbolicSub(infoTable, code);
    var lines = getLines(codeSimbolic);
    var inputsId = getIdInput();
    var conditionWithValue = getValueCondition(codeSimbolic, inputsId, '1, 2, 3', 3);

    it('condition 1', () => {
        assert.equal(conditionWithValue[0], true);
    });

    it('line 2 ', () => {
        assert.equal(lines[1], "        if ( y  +  z  *  z  >  0 ) {");
    });
});





