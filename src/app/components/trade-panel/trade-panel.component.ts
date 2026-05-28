import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ChartService } from '../../services/chart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-trade-panel',
  templateUrl: './trade-panel.component.html',
  styleUrls: ['./trade-panel.component.scss']
})
export class TradePanelComponent {
  @Input() isFloating: boolean = false;
  @Output() float = new EventEmitter<void>();
  @Output() dock = new EventEmitter<void>();

  activeSymbol$: Observable<string | null>;
  tradePrice$: Observable<number>;
  tradeQuantity$: Observable<number>;

  constructor(private chartService: ChartService) {
    this.activeSymbol$ = this.chartService.selectedChartId$;
    this.tradePrice$ = this.chartService.tradePrice$;
    this.tradeQuantity$ = this.chartService.tradeQuantity$;
  }

  updatePrice(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.chartService.setTradePrice(parseFloat(val) || 0);
  }

  updateQuantity(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.chartService.setTradeQuantity(parseInt(val, 10) || 0);
  }
}
