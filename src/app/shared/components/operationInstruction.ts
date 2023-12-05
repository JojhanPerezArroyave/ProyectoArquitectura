import {
  Instructions,
  VarInstructions,
} from '../models/enums/instructions.enum';

export class OperationInstruction {
  operation?: Instructions;
  firstOperand?: number;
  secondOperand?: number;
  thirdOperand?: number;
  instructionText?: string;

  constructor(instructionText: string) {
    this.instructionText = instructionText;
    this.segmentInstruction();
  }

  segmentInstruction() {
    let instructionArray = this.instructionText?.split(' ');
    this.operation = this.getOperation(instructionArray![0]);
    this.firstOperand = this.getOperand(instructionArray![1]);
    this.secondOperand = this.getOperand(instructionArray![2]);
    this.thirdOperand = this.getOperand(instructionArray![3]);
  }

  getOperation(operation: string) {
    switch (operation) {
      case Instructions.LOAD:
        return Instructions.LOAD;
      case Instructions.STOP:
        return Instructions.STOP;
      case Instructions.ADD:
        return Instructions.ADD;
      case Instructions.SUB:
        return Instructions.SUB;
      case Instructions.MUL:
        return Instructions.MUL;
      case Instructions.DIV:
        return Instructions.DIV;
      case Instructions.JUMP:
        return Instructions.JUMP;
      default:
        return Instructions.STOP;
    }
  }

  getOperand(operand: string) {
    switch (operand?.toUpperCase()) {
      case 'A':
        return VarInstructions.A;
      case 'B':
        return VarInstructions.B;
      case 'C':
        return VarInstructions.C;
      case 'D':
        return VarInstructions.D;
      case 'E':
        return VarInstructions.E;
      case 'F':
        return VarInstructions.F;
      case 'G':
        return VarInstructions.G;
      case 'H':
        return VarInstructions.H;
      case 'I':
        return VarInstructions.I;
      case 'J':
        return VarInstructions.J;
      default:
        return 0;
    }
  }
}
