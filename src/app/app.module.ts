import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { App } from './app';
import { PanelHeaderComponent } from './components/panel-header/panel-header.component';
import { SingleChartComponent } from './components/single-chart/single-chart.component';
import { ChartPanelComponent } from './components/chart-panel/chart-panel.component';
import { CapitalPanelComponent } from './components/capital-panel/capital-panel.component';
import { MarketPanelComponent } from './components/market-panel/market-panel.component';
import { TradePanelComponent } from './components/trade-panel/trade-panel.component';
import { ReportPanelComponent } from './components/report-panel/report-panel.component';
import { ChartCapitalPanelComponent } from './components/chart-capital-panel/chart-capital-panel.component';
import { ChartService } from './services/chart.service';

@NgModule({
  declarations: [
    App,
    PanelHeaderComponent,
    SingleChartComponent,
    ChartPanelComponent,
    CapitalPanelComponent,
    MarketPanelComponent,
    TradePanelComponent,
    ReportPanelComponent,
    ChartCapitalPanelComponent,
  ],
  imports: [BrowserModule, CommonModule, DragDropModule],
  providers: [ChartService],
  bootstrap: [App],
})
export class AppModule {}
