import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-report-panel',
  templateUrl: './report-panel.component.html',
  styleUrls: ['./report-panel.component.scss']
})
export class ReportPanelComponent {
  @Input() isFloating = false;
  @Output() close = new EventEmitter<void>();
  @Output() float = new EventEmitter<void>();
  @Output() dock = new EventEmitter<void>();
}
