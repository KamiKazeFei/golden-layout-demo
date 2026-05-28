import { Component, Input } from '@angular/core';
import { ChartService } from '../../services/chart.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-single-chart',
  templateUrl: './single-chart.component.html',
  styleUrls: ['./single-chart.component.scss']
})
export class SingleChartComponent {
  @Input() symbol: string = '';
  @Input() showBorder: boolean = true;

  isActive$: Observable<boolean>;

  constructor(private chartService: ChartService) {
    this.isActive$ = this.chartService.selectedChartId$.pipe(map((id) => id === this.symbol));
  }

  select() {
    this.chartService.selectChart(this.symbol);
  }
}
