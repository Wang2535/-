import type { Coordinate2D } from '../types';

export interface PlayerPieceState {
  cellId: string;
  position: Coordinate2D;
  isMoving: boolean;
}

export class PlayerPieceManager {
  private currentCellId: string = '';
  private currentPosition: Coordinate2D = [0, 0];
  private isMoving: boolean = false;

  initialize(startCellId: string, startPosition: Coordinate2D): void {
    this.currentCellId = startCellId;
    this.currentPosition = startPosition;
    this.isMoving = false;
  }

  getCurrentCellId(): string {
    return this.currentCellId;
  }

  setCurrentCellId(cellId: string): void {
    this.currentCellId = cellId;
  }

  getPosition(): Coordinate2D {
    return this.currentPosition;
  }

  setPosition(position: Coordinate2D): void {
    this.currentPosition = position;
  }

  isPieceMoving(): boolean {
    return this.isMoving;
  }

  setMoving(moving: boolean): void {
    this.isMoving = moving;
  }

  getState(): PlayerPieceState {
    return {
      cellId: this.currentCellId,
      position: this.currentPosition,
      isMoving: this.isMoving,
    };
  }

  reset(): void {
    this.currentCellId = '';
    this.currentPosition = [0, 0];
    this.isMoving = false;
  }
}
