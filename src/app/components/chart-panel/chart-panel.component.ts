import { Component } from '@angular/core';
import { ChartService } from '../../services/chart.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chart-panel',
  templateUrl: './chart-panel.component.html',
  styleUrls: ['./chart-panel.component.scss']
})
export class ChartPanelComponent {
  allSymbols = ['TX06', 'TE06', 'TF06', 'MTX06'];

  chartCount$: Observable<number>;
  symbols$: Observable<string[]>;

  constructor(private chartService: ChartService) {
    this.chartCount$ = this.chartService.chartCount$;
    this.symbols$ = this.chartService.chartCount$.pipe(
      map((count) => this.allSymbols.slice(0, count)),
    );

    if (!this.chartService.currentSelectedChartId) {
      this.chartService.selectChart(this.allSymbols[0]);
    }
  }

  setLayout(n: number) {
    this.chartService.setChartCount(n);
    if (n === 1) {
      this.chartService.selectChart(this.allSymbols[0]);
    }
  }
}
