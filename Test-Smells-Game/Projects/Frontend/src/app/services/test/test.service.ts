import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestSummaryService {
  private data: any = null;

  constructor() { }

  setData(data: any): void {
    this.data = data;
  }

  getData(): any {
    return this.data;
  }

  clearData(): void {
    this.data = null;
  }
}
