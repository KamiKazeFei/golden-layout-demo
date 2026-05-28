import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  ComponentRef,
  Type,
} from '@angular/core';
import { GoldenLayout, LayoutConfig, ComponentContainer } from 'golden-layout';
import { ChartPanelComponent } from './components/chart-panel/chart-panel.component';
import { CapitalPanelComponent } from './components/capital-panel/capital-panel.component';
import { ReportPanelComponent } from './components/report-panel/report-panel.component';
import { MarketPanelComponent } from './components/market-panel/market-panel.component';
import { TradePanelComponent } from './components/trade-panel/trade-panel.component';
import { ChartCapitalPanelComponent } from './components/chart-capital-panel/chart-capital-panel.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class App implements AfterViewInit {
  @ViewChild('glRoot', { static: true }) glRoot!: ElementRef<HTMLElement>;

  goldenLayout!: GoldenLayout;

  isTradeFloating$ = new BehaviorSubject<boolean>(false);
  isReportFloating$ = new BehaviorSubject<boolean>(false);
  isReportClosed$ = new BehaviorSubject<boolean>(false);
  isSwapping = false;

  tradeContainer: ComponentContainer | null = null;
  reportContainer: ComponentContainer | null = null;

  // Track original position and size for floating panels
  tradeFloatingStyles: { [key: string]: string } = {};
  reportFloatingStyles: { [key: string]: string } = {};

  private componentRefs = new Map<ComponentContainer, ComponentRef<any>>();

  private defaultConfig: LayoutConfig = {
    root: {
      type: 'row',
      content: [
        {
          type: 'column',
          width: 70,
          content: [
            { type: 'component', componentType: 'chart-capital', title: '圖表與資金', size: '70%' },
            { type: 'component', componentType: 'report', title: '報表', size: '30%' },
          ],
        },
        {
          type: 'column',
          width: 30,
          content: [
            { type: 'component', componentType: 'market', title: '行情(簡易)', size: '50%' },
            { type: 'component', componentType: 'trade', title: '交易', size: '50%' },
          ],
        },
      ],
    },
    header: {
      show: false,
      popout: false,
    },
  };

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit() {
    this.goldenLayout = new GoldenLayout(this.glRoot.nativeElement);

    this.registerComponent('chart-capital', ChartCapitalPanelComponent);
    this.registerComponent('market', MarketPanelComponent);

    this.registerComponent('report', ReportPanelComponent, (instance, container) => {
      this.reportContainer = container;
      this.isReportClosed$.next(false);
      instance.close.subscribe(() => {
        if (this.reportContainer) {
          this.reportContainer.close();
        }
      });
      instance.float.subscribe(() => this.floatReport());
      container.on('destroy', () => {
        if (!this.isSwapping && !this.isReportFloating$.value) {
          this.isReportClosed$.next(true);
        }
        this.reportContainer = null;
      });
    });

    this.registerComponent('trade', TradePanelComponent, (instance, container) => {
      this.tradeContainer = container;
      instance.float.subscribe(() => this.floatTrade());
      container.on('destroy', () => {
        if (!this.isTradeFloating$.value) this.tradeContainer = null;
      });
    });

    this.goldenLayout.loadLayout(this.defaultConfig);
  }

  private registerComponent(
    name: string,
    componentType: Type<any>,
    initFn?: (instance: any, container: ComponentContainer) => void,
  ) {
    this.goldenLayout.registerComponentFactoryFunction(name, (container) => {
      const componentRef = this.viewContainerRef.createComponent(componentType);
      container.element.appendChild(componentRef.location.nativeElement);
      this.componentRefs.set(container, componentRef);
      if (initFn) initFn(componentRef.instance, container);
      container.on('destroy', () => {
        componentRef.destroy();
        this.componentRefs.delete(container);
      });
      return undefined;
    });
  }

  swapPanels() {
    this.isSwapping = true;
    const resolvedConfig = this.goldenLayout.saveLayout();
    const config = LayoutConfig.fromResolved(resolvedConfig);
    if (config.root && config.root.content && config.root.content.length > 1) {
      if (config.root.type === 'row') {
        config.root.content.reverse();
        this.goldenLayout.loadLayout(config);
      }
    }
    this.isSwapping = false;
  }

  floatTrade() {
    if (this.tradeContainer) {
      const el = this.tradeContainer.element;
      const rect = el.getBoundingClientRect();
      const parentRect = this.glRoot.nativeElement.getBoundingClientRect();

      // Set initial styles: same size, slightly offset to top-left
      this.tradeFloatingStyles = {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        top: `${rect.top - parentRect.top - 20}px`,
        left: `${rect.left - parentRect.left - 20}px`,
      };

      this.tradeContainer.close();
      this.tradeContainer = null;
    }
    this.isTradeFloating$.next(true);
  }

  dockTrade(sizeSetting: string | number = '300px') {
    this.isTradeFloating$.next(false);
    this.isSwapping = true;
    const resolvedConfig = this.goldenLayout.saveLayout();
    const config = LayoutConfig.fromResolved(resolvedConfig);

    const injectTrade = (items: any[]): any[] => {
      let result: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isMarketStack =
          item.type === 'stack' &&
          item.content &&
          item.content.some((c: any) => c.componentType === 'market');
        const isMarketComponent = item.type === 'component' && item.componentType === 'market';
        if (isMarketStack || isMarketComponent) {
          const tradeStack: any = {
            type: 'stack',
            content: [{ type: 'component', componentType: 'trade', title: '交易' }],
          };
          if (typeof sizeSetting === 'string' && sizeSetting.endsWith('px')) {
            const pxValue = parseInt(sizeSetting, 10);
            const totalHeight = this.glRoot.nativeElement.offsetHeight;
            tradeStack.size = totalHeight > 0 ? `${(pxValue / totalHeight) * 100}%` : '30%';
          } else if (typeof sizeSetting === 'number') {
            tradeStack.size = `${sizeSetting}%`;
          } else {
            tradeStack.size = sizeSetting;
          }
          item.size = '1fr';
          result.push({ __isReplacement: true, width: item.width, items: [item, tradeStack] });
          continue;
        }
        if (item.content) {
          const processedContent = injectTrade(item.content);
          const newContent: any[] = [];
          for (let j = 0; j < processedContent.length; j++) {
            const child = processedContent[j];
            if (child && child.__isReplacement) {
              if (item.type === 'column') newContent.push(...child.items);
              else newContent.push({ type: 'column', width: child.width, content: child.items });
            } else newContent.push(child);
          }
          item.content = newContent;
        }
        result.push(item);
      }
      return result;
    };

    if (config.root && (config.root as any).content) {
      const processedRoot = injectTrade((config.root as any).content);
      const newRootContent: any[] = [];
      for (let j = 0; j < processedRoot.length; j++) {
        const child = processedRoot[j];
        if (child && child.__isReplacement) {
          if (config.root.type === 'column') newRootContent.push(...child.items);
          else newRootContent.push({ type: 'column', width: child.width, content: child.items });
        } else newRootContent.push(child);
      }
      (config.root as any).content = newRootContent;
    }
    this.goldenLayout.loadLayout(config);
    this.isSwapping = false;
  }

  floatReport() {
    if (this.reportContainer) {
      const el = this.reportContainer.element;
      const rect = el.getBoundingClientRect();
      const parentRect = this.glRoot.nativeElement.getBoundingClientRect();

      // Set initial styles: same size, slightly offset to top-right (decreased top, increased left)
      // Or just slightly offset from its current position
      this.reportFloatingStyles = {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        top: `${rect.top - parentRect.top - 20}px`,
        left: `${rect.left - parentRect.left + 20}px`,
      };

      this.reportContainer.close();
      this.reportContainer = null;
    }
    this.isReportFloating$.next(true);
  }

  dockReport(sizeSetting: string | number = '30%') {
    this.isReportFloating$.next(false);
    this.reopenReport(sizeSetting);
  }

  reopenReport(sizeSetting: string | number = '30%') {
    if (this.isReportClosed$.value || !this.isReportFloating$.value) {
      this.isSwapping = true;
      const resolvedConfig = this.goldenLayout.saveLayout();
      const config = LayoutConfig.fromResolved(resolvedConfig);

      const isChartCapital = (item: any) => {
        if (item.type === 'component' && item.componentType === 'chart-capital') return true;
        if (
          item.type === 'stack' &&
          item.content &&
          item.content.some((c: any) => c.componentType === 'chart-capital')
        )
          return true;
        return false;
      };

      const findAndInjectReport = (items: any[], parent: any): boolean => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (isChartCapital(item)) {
            if (parent.type !== 'column') {
              const newColumn: any = {
                type: 'column',
                size: item.size || '70%',
                content: [
                  { ...item, size: '70%' },
                  { type: 'component', componentType: 'report', title: '報表', size: sizeSetting },
                ],
              };
              items[i] = newColumn;
              return true;
            } else {
              items.push({
                type: 'component',
                componentType: 'report',
                title: '報表',
                size: sizeSetting,
              });
              item.size = '70%';
              return true;
            }
          }
          if (item.content && findAndInjectReport(item.content, item)) return true;
        }
        return false;
      };

      if (config.root) {
        const rootContent = (config.root as any).content || [];
        if (isChartCapital(config.root)) {
          const oldRoot = { ...config.root, size: '70%' };
          config.root = {
            type: 'column',
            content: [
              oldRoot,
              { type: 'component', componentType: 'report', title: '報表', size: sizeSetting },
            ],
          } as any;
        } else if (!findAndInjectReport(rootContent, config.root)) {
          this.goldenLayout.addComponent('report');
        } else {
          this.goldenLayout.loadLayout(config);
        }
      }

      this.isReportClosed$.next(false);
      this.isSwapping = false;
    }
  }
}
