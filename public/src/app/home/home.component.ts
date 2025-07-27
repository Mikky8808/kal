import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggingService } from '../logging.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(private logger: LoggingService) {}

  ngOnInit(): void {
    this.logger.log('HomeComponent Initialized');
  }

  ngOnDestroy(): void {
    this.logger.log('HomeComponent Destroyed');
  }
}