import { Component } from '@angular/core';
import { CpuElements } from './shared/models/enums/cpuElements.enum';
import { Status } from './shared/models/enums/status.enum';
import { Instructions, VarInstructions } from './shared/models/enums/instructions.enum';
import { ALU } from './shared/components/ALU';
import { Memory } from './shared/components/memory';
import { GeneralMemory } from './shared/models/generalMemory.model';
import { TaskExecuteService } from './shared/services/task-execute.service';
import { OperationInstruction } from './shared/components/operationInstruction';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  enteredInstruction: string = '';
  activeElement: CpuElements;
  status: Status;
  lastModifiedValue: number | undefined;

  PC: number = 0;
  MAR: number = 0;
  MBR: OperationInstruction | undefined;
  IR: OperationInstruction | undefined;
  ALU: ALU = new ALU();
  memory: Memory = new Memory();
  generalMemory: GeneralMemory = new GeneralMemory();

  constructor(private taskExecuteService:TaskExecuteService) {
    this.status = Status.STOPPED;
    this.activeElement = CpuElements.UC;
  }

  loadAndExecuteInstructions() {
    this.status = Status.RUNNING;
    this.saveInstructionMemory();
    this.executeSaveIntructions();
  }

  private saveInstructionMemory() {
    this.memory = new Memory();
    let instruccionesArray = this.enteredInstruction.split('\n');
    instruccionesArray.forEach((instruccion) => {
      this.memory.addInstruction(instruccion);
    });
  }

  private lineForExecute() {
    return this.PC < this.memory.cells.length;
  }

  private async executeSaveIntructions() {
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.PC;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.MAR;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.MAR = this.PC;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.ADDRESS_BUS;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.MEMORY;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.DATA_BUS;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.MBR;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.MBR = this.memory.getInstruction(this.PC);
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.IR;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.IR = this.MBR;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.UC;
    })
    await this.taskExecuteService.timeForExecution(async () => {
      await this.instructionExecute();
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.UC;
    })
    if (this.lineForExecute()) {
      this.PC++;
      if (this.status === Status.STOPPED) {
        return; 
      }
      this.executeSaveIntructions();
    } else {
      this.status = Status.STOPPED;
    }
  }

  private async instructionExecute(): Promise<void> {
    if (this.IR == undefined) {
      return;
    }
    const operation = this.IR.operation;
    const firstOperand: number | VarInstructions| undefined = this.IR.firstOperand;
    const secondOperant: number | VarInstructions| undefined = this.IR.secondOperand;
    const thirdOperand: number | VarInstructions| undefined = this.IR.thirdOperand;
    console.log(operation, firstOperand, secondOperant, thirdOperand);
    
    
    switch (operation) {
      case Instructions.LOAD:
        await this.executeInstructionLoad(firstOperand, secondOperant);
        break;
      case Instructions.ADD:
        await this.executeMatematicInstruction(Instructions.ADD,firstOperand, secondOperant, thirdOperand);
        break;
      case Instructions.SUB:
        await this.executeMatematicInstruction(Instructions.SUB,firstOperand, secondOperant, thirdOperand);
        break;
      case Instructions.MUL:
        await this.executeMatematicInstruction(Instructions.MUL,firstOperand, secondOperant, thirdOperand);
        break;
      case Instructions.DIV:
        await this.executeMatematicInstruction(Instructions.DIV,firstOperand, secondOperant, thirdOperand);
        break;
      case Instructions.INC:
        await this.executeMatematicInstruction(Instructions.INC, firstOperand,0, firstOperand);
        break;
      default:
        break;
    }
  }
  
  private async executeInstructionLoad(varToSave: number | VarInstructions| undefined, number: number | VarInstructions| undefined): Promise<void> {
    if (varToSave == undefined || number == undefined) {
      return;
    }
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.GENERAL_MEMORY;
    })

    await this.taskExecuteService.timeForExecution(() => {
      console.log(number);
      
      switch(varToSave) {
        case VarInstructions.A:
          this.generalMemory.A = number;      
          break;
        case VarInstructions.B:
          this.generalMemory.B = number;
          break;
        case VarInstructions.C:
          this.generalMemory.C = number;
          break;
        case VarInstructions.D:
          this.generalMemory.D = number;
          break;
        case VarInstructions.E:
          this.generalMemory.E = number;
          break;
        case VarInstructions.F:
          this.generalMemory.F = number;
          break;
        case VarInstructions.G:
          this.generalMemory.G = number;
          break;
        case VarInstructions.H:
          this.generalMemory.H = number;
          break;
        default:
          break;
      }
    })
  }

  private async executeMatematicInstruction(operationType: Instructions, primeraVariable: number | VarInstructions| undefined, segundaVariable: number | VarInstructions| undefined, variableDestino: number | VarInstructions| undefined): Promise<void> {
    if (primeraVariable == undefined || segundaVariable == undefined) {
      return;
    }
    switch(variableDestino) {
      case VarInstructions.A:
        this.generalMemory.A = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      case VarInstructions.B:
        this.generalMemory.B = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      case VarInstructions.C:
        this.generalMemory.C = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      case VarInstructions.D:
        this.generalMemory.D = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      case VarInstructions.E:
        this.generalMemory.E = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      case VarInstructions.F:
        this.generalMemory.F = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      case VarInstructions.G:
        this.generalMemory.G = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      case VarInstructions.H:
        this.generalMemory.H = await this.executeAluOperation(operationType, primeraVariable, segundaVariable);
        break;
      default:
        break;
    }
    let valueToSave = variableDestino == undefined ? 0 : this.getValueGeneralMemory(variableDestino);
    this.lastModifiedValue = valueToSave;
  }

  private async executeAluOperation(operation: Instructions, firstOperand: number | VarInstructions| undefined, secondOperant: number | VarInstructions| undefined): Promise<number> {
    if (firstOperand == undefined || secondOperant == undefined) {
      return 0;
    }
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.ALU;
    })
    await this.taskExecuteService.timeForExecution(() => {
      this.activeElement = CpuElements.GENERAL_MEMORY;
    })
    const firstnumber = this.getValueGeneralMemory(firstOperand);
    const secondNumber = this.getValueGeneralMemory(secondOperant);
    const resultOperation = this.ALU.executeOperation(operation, firstnumber, secondNumber);
    return resultOperation;
  }

   getValueGeneralMemory(getToVar: number | VarInstructions| undefined) {
    if (getToVar == undefined) {
      return 0;
    }
    switch(getToVar) {
      case VarInstructions.A:
        return this.generalMemory.A;
      case VarInstructions.B:
        return this.generalMemory.B;
      case VarInstructions.C:
        return this.generalMemory.C;
      case VarInstructions.D:
        return this.generalMemory.D;
      case VarInstructions.E:
        return this.generalMemory.E;
      case VarInstructions.F:
        return this.generalMemory.F;
      case VarInstructions.G:
        return this.generalMemory.G;
      case VarInstructions.H:
        return this.generalMemory.H;
      default:
        return 0;
    }
  }

  // private async executeInstructionInc(operation: Instructions, firstOperand: number | VarInstructions| undefined): Promise<number> {
  //   return 0;
  // }

  get enableExecuteButton(): boolean {
    return this.status == Status.STOPPED;
  }

  get enablePauseButton(): boolean {
    return this.status == Status.RUNNING;
  }

  get enableContinueButton(): boolean {
    return this.status == Status.PAUSED;
  }

  get ucIsActive(): boolean {
    return this.activeElement == CpuElements.UC;
  }

  get memoryIsActive(): boolean {
    return this.activeElement == CpuElements.MEMORY;
  }

  get aluIsActive(): boolean {
    return this.activeElement == CpuElements.ALU;
  }

  get generalMemoryIsActive(): boolean {
    return this.activeElement == CpuElements.GENERAL_MEMORY;
  }

  get pcIsActive(): boolean {
    return this.activeElement == CpuElements.PC;
  }

  get marIsActive(): boolean {
    return this.activeElement == CpuElements.MAR;
  }

  get mbrIsActive(): boolean {
    return this.activeElement == CpuElements.MBR;
  }

  get irIsActive(): boolean {
    return this.activeElement == CpuElements.IR;
  }

  get dataBusIsActive(): boolean {
    return this.activeElement == CpuElements.DATA_BUS;
  }

  get addressBusIsActive(): boolean {
    return this.activeElement == CpuElements.ADDRESS_BUS;
  }

  get controlBusIsActive(): boolean {
    return this.activeElement == CpuElements.CONTROL_BUS;
  }

  stopExecution() {
    this.status = Status.STOPPED;
  }

  get enableStopButton(): boolean {
    return this.status === Status.RUNNING;
  }  
  
}
