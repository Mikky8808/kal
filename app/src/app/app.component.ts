import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { LoggingService } from './logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private router: Router, private logger: LoggingService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.logger.log('Navigation Started', event);
      } else if (event instanceof NavigationEnd) {
        this.logger.log('Navigation Ended', event);
      }
    });
  }
}