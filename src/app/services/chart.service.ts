import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  // 紀錄當前選中的圖表 ID (商品名稱)
  private _selectedChartId = new BehaviorSubject<string | null>(null);
  selectedChartId$ = this._selectedChartId.asObservable();

  // 紀錄當前圖表顯示數量
  private _chartCount = new BehaviorSubject<number>(1);
  chartCount$ = this._chartCount.asObservable();

  // 紀錄交易面板數據
  private _tradePrice = new BehaviorSubject<number>(21500);
  tradePrice$ = this._tradePrice.asObservable();

  private _tradeQuantity = new BehaviorSubject<number>(1);
  tradeQuantity$ = this._tradeQuantity.asObservable();

  // Getter for current values (non-reactive)
  get currentSelectedChartId() {
    return this._selectedChartId.value;
  }
  get currentChartCount() {
    return this._chartCount.value;
  }
  get currentTradePrice() {
    return this._tradePrice.value;
  }
  get currentTradeQuantity() {
    return this._tradeQuantity.value;
  }

  selectChart(id: string) {
    this._selectedChartId.next(id);
    console.log('當前選中商品:', id);
  }

  setChartCount(count: number) {
    this._chartCount.next(count);
  }

  setTradePrice(price: number) {
    this._tradePrice.next(price);
  }

  setTradeQuantity(qty: number) {
    this._tradeQuantity.next(qty);
  }
}
