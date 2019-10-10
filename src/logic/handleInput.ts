import { evaluate } from 'mathjs';
import buttons, { Button, Label } from '../constants/buttons';
import { AppState } from '../components/AppState';

function selectButton(label: Label): Button | never {
  const button = buttons.find(btn => btn.label === label);
  if (!button) throw new Error('Invalid button label');
  return button;
}

function evaluateExp(displayValue: string): AppState | null {
  const lastOp =
    ['/', '*', '+', '-'].indexOf(displayValue[displayValue.length - 1]) !== -1;
  const lastPoint = displayValue.slice(-1) === '.';
  if (!lastOp && !lastPoint) {
    return {
      displayValue: (
        Math.round(1000000000000 * evaluate(displayValue)) / 1000000000000
      ).toString(),
      isResult: true,
    };
  }
  return null;
}

function handleNum(
  num: string,
  displayValue: string,
  isResult: boolean
): Partial<AppState> | null {
  const hasMaxDigit = displayValue.length >= 18;
  if (displayValue === '0' || isResult) {
    return {
      displayValue: num,
      isResult: false,
    };
  }
  if (!hasMaxDigit) {
    return {
      displayValue: displayValue + num,
    };
  }
  return null;
}

function handleParen(
  paren: string,
  displayValue: string,
  isResult: boolean
): Partial<AppState> | null {
  const hasMaxDigit = displayValue.length >= 18;
  if (displayValue === '0' || isResult) {
    return {
      displayValue: paren,
      isResult: false,
    };
  }
  if (!hasMaxDigit) {
    return {
      displayValue: displayValue + paren,
    };
  }
  return null;
}

function handleExt(
  ext: string,
  displayValue: string,
  isResult: boolean
): Partial<AppState> | null {
  let toDisplay = '';
  if (ext === 'sin' || ext === 'cos' || ext === 'tan' || ext === 'log')
    toDisplay = `${ext}(`;
  if (ext === 'π') toDisplay = 'pi';
  if (ext === 'x²') toDisplay = '^2';
  if (ext === 'x!') toDisplay = '!';
  if (ext === '√') toDisplay = 'sqrt(';
  const hasMaxDigit = displayValue.length >= 18;
  if (displayValue === '0' && toDisplay !== '^2' && toDisplay !== '!') {
    return {
      displayValue: toDisplay,
      isResult: false,
    };
  }
  if (!hasMaxDigit) {
    return {
      displayValue: displayValue + toDisplay,
    };
  }
  return null;
}

function handleOp(
  op: string,
  displayValue: string,
  isResult: boolean
): AppState | null {
  const lastOp =
    ['/', '*', '+', '-'].indexOf(displayValue[displayValue.length - 1]) !== -1;
  const lastPoint = displayValue.slice(-1) === '.';
  const isMaxDigit = displayValue.length >= 18;
  if (displayValue === '0') {
    return {
      displayValue: displayValue + op,
      isResult: false,
    };
  }
  if (!lastOp && !lastPoint && displayValue !== '0' && !isMaxDigit) {
    return {
      displayValue: displayValue + op,
      isResult: false,
    };
  }
  if (lastOp) {
    return {
      displayValue: displayValue.slice(0, -1) + op,
      isResult: false,
    };
  }
  return null;
}

function handleDecimal(
  displayValue: string,
  isResult: boolean
): Partial<AppState> | null {
  const displayArr = displayValue.split(/[+\-*/]/);
  const pointCond = displayArr[displayArr.length - 1].indexOf('.') !== -1;
  const isMaxDigit = displayValue.length >= 18;
  if (!pointCond && !isResult && !isMaxDigit) {
    return {
      displayValue: `${displayValue}.`,
    };
  }
  if (isResult) {
    return {
      displayValue: '0.',
      isResult: false,
    };
  }
  return null;
}

function handleClear(label: Label, displayValue: string): Partial<AppState> {
  if (label === 'AC') return { displayValue: '0' };
  return {
    displayValue: displayValue.length > 1 ? displayValue.slice(0, -1) : '0',
  };
}

export default function handleInput(
  label: Label,
  state: AppState
): Partial<AppState> | null {
  const { displayValue, isResult } = state;
  const button = selectButton(label);
  if (button.type === 'clear') return handleClear(label, displayValue);
  if (button.type === 'number') return handleNum(label, displayValue, isResult);
  if (button.type === 'operation')
    return handleOp(label, displayValue, isResult);
  if (button.type === 'decimal') return handleDecimal(displayValue, isResult);
  if (button.type === 'equals') return evaluateExp(displayValue);
  if (button.type === 'ext') return handleExt(label, displayValue, isResult);
  if (button.type === 'paren')
    return handleParen(label, displayValue, isResult);
  return null;
}
