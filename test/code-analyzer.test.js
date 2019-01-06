import assert from 'assert';
import { parseCode } from '../src/js/code-analyzer';
import { Parsing, getParamsName } from '../src/js/parse';
import { clear } from '../src/js/parse';
import { clearSymbolic } from '../src/js/symbolic-substitution';

describe('function declaration', () => {
    var elementTest = parseCode('function binarySearch(){}');
    var infoTable = Parsing(elementTest.body);
    it('Type', () => {
        assert.equal(infoTable[0].Type, 'function declaration');
    });
    it('Name', () => {
        assert.equal(infoTable[0].Name, 'binarySearch');
    });
    it('Number of the line', () => {
        assert.equal(infoTable[0].Line, '1');
    });
});

describe('Params Function', () => {
    clear();
    var elementTest = parseCode('function binarySearch(X,V,n){}');

    var infoTable = Parsing(elementTest.body);
    it('variable declaration type', () => {
        assert.equal(infoTable[1].Type, 'variable declaration');
    });
    it('function declaration name name', () => {
        assert.equal(infoTable[1].Name, 'X');
    });
    it('function declaration Line', () => {
        assert.equal(infoTable[1].Line, '1');

    });
});

describe('variable declaration', () => {
    clear();
    var elementTest = parseCode('let low,high,mid; low=0;high=n-1;');
    var infoTable = Parsing(elementTest.body);
    it('variable declaration type', () => {
        assert.equal(infoTable[0].Type, 'variable declaration');
    });
    it('variable declaration Name', () => {
        assert.equal(infoTable[0].Name, 'low');
    });
    it('variable declaration Line', () => {
        assert.equal(infoTable[0].Line, 1);
    });
});

describe('let', () => {
    clear();
    var elementTest = parseCode('let a = 1;');
    var infoTable = Parsing(elementTest.body);
    it('let type', () => {
        assert.equal(infoTable[0].Type, 'variable declaration');
    });
    it('let Name', () => {
        assert.equal(infoTable[0].Name, 'a');
    });
    it('let Value', () => {
        assert.equal(infoTable[0].Value, '1');
    });
});

describe('Member Expression', () => {
    clear();
    var elementTest = parseCode('a[5]=10;a[n-4]=50;x=a[i++];x=a[++i];');
    var infoTable = Parsing(elementTest.body);
    it('Member Expression Name', () => {
        assert.equal(infoTable[0].Name, 'a[5]');
    });
    it('Member Expression Name', () => {
        assert.equal(infoTable[1].Name, 'a[n - 4]');
    });
    it('Member Expression Name', () => {
        assert.equal(infoTable[2].Value, 'a[i++]');
    });
    it('Member Expression Name', () => {
        assert.equal(infoTable[3].Value, 'a[++i]');
    });
});

describe('Boolean', () => {
    clear();
    var elementTest = parseCode('a=true;a=false; while(a){} if(!a){}');
    var infoTable = Parsing(elementTest.body);
    it('Name', () => {
        assert.equal(infoTable[0].Name, 'a');
    });
    it('Name', () => {
        assert.equal(infoTable[0].Value, true);
    });
    it('Name', () => {
        assert.equal(infoTable[1].Value, false);
    });
    it('Condition', () => {
        assert.equal(infoTable[2].Condition, 'a');
    });
    it('Condition', () => {
        assert.equal(infoTable[3].Condition, '!a');
    });
});

describe('Update Expression', () => {
    clear();
    var elementTest = parseCode('a++;++a;a--;--a;');
    var infoTable = Parsing(elementTest.body);
    it('Update Expression type', () => {
        assert.equal(infoTable[0].Type, 'assignment expression');
    });
    it('Update Expression Name', () => {
        assert.equal(infoTable[0].Name, 'a');
    });
    it('Update Expression Value', () => {
        assert.equal(infoTable[0].Value, 'a++');
    });
    it('Update Expression Value', () => {
        assert.equal(infoTable[1].Value, '++a');
    });
    it('Update Expression Value', () => {
        assert.equal(infoTable[2].Value, 'a--');
    });
    it('Update Expression Value', () => {
        assert.equal(infoTable[3].Value, '--a');
    });
});

describe('Return Statement', () => {
    clear();
    var elementTest = parseCode(`function binarySearch(X){
        return -1;
    }`);
    var infoTable = Parsing(elementTest.body);
    it('return statement type', () => {
        assert.equal(infoTable[2].Type, 'return statement');
    });
    it('return statement Name', () => {
        assert.equal(infoTable[2].Name, undefined);
    });
    it('return statement Line', () => {
        assert.equal(infoTable[2].Line, '2');
    });
    it('return statement Value', () => {
        assert.equal(infoTable[2].Value, '-1');
    });
    it('return statement Condition', () => {
        assert.equal(infoTable[2].Condition, undefined);
    });
});

describe('if Statement', () => {
    clearSymbolic();
    clear();
    var code = `function binarySearch(X, n){
        let low, high, mid;
        low = 0;
        high = n - 1;
        while (low <= high) {
            mid = (low + high)/2;
            if (X < 5)
                high = mid - 1;
            else if (X > 10)
                low = mid + 1;
            else
                return mid;
        }
        return -1;
    }`
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    it('if statement type', () => {
        assert.equal(infoTable[0].Type, "function declaration");
    });
});
describe('if Statement', () => {
    clearSymbolic();
    clear();
    var code = `function binarySearch(X, n){
        let low, high, mid;
        low = 0;
        high = n - 1;
        while (low <= high) {
            mid = (low + high)/2;
            if (X < 5)
                high = mid - 1;
            else if (X > 10)
                low = mid + 1;
        }
        return -1;
    }`
    var elementTest = parseCode(code);
    var infoTable = Parsing(elementTest.body);
    it('if statement type', () => {
        assert.equal(infoTable[0].Type, "function declaration");
    });
});


describe('For Statement', () => {
    clear();
    var elementTest = parseCode('for(i=10-(n-5);i<100;i=i+1){}for(let i=0 ;i<100;i++){}for(i=n;i<=n+5;i=i+1){}for(let i=n-5 ;i<100;i++){}');
    var infoTable = Parsing(elementTest.body);
    it('For statement type', () => {
        assert.equal(infoTable[0].Type, 'for statement');
    });
    it('For statement Name', () => {
        assert.equal(infoTable[0].Name, undefined);
    });
    it('For statement Value', () => {
        assert.equal(infoTable[0].Value, undefined);
    });
    // it('For statement Condition1', () => {
    //     assert.equal(infoTable[0].Condition, 'i = 10 - n - 5 ; i < 100 ; i = i + 1');
    // });
    it('For statement Condition2', () => {
        assert.equal(infoTable[1].Condition, 'i = 0 ; i < 100 ; i++');
    });
    // it('For statement Condition3', () => {
    //     assert.equal(infoTable[2].Condition, 'i = n ; i <= (n + 5) ; i = i + 1');
    // });
    it('For statement Condition4', () => {
        assert.equal(infoTable[3].Condition, 'i = n - 5 ; i < 100 ; i++');
    });
});


describe('For Statement', () => {
    clear();
    var elementTest = parseCode(`function Sort(arr){
        for(let i =0;i<arr.length -1 ; i++){
           for(let j =0;j<arr.length - (1+1) ; j++){
              if (arr[j]>arr[j+1]){
                  let temp = arr[j];
                  arr[j]=arr[j+1];
                  arr[j+1]=temp;
               }
            }
        }
        return arr;
     }`);
    var infoTable = Parsing(elementTest.body);
    var params=getParamsName();
    it('For statement condition', () => {
        assert.equal(infoTable[2].Condition, "i = 0 ; i < arr.length - 1 ; i++");
    });
});

