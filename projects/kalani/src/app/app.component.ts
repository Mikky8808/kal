import { Component } from '@angular/core';
import { SessionService } from 'projects/@session/src/lib/session.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private http: HttpClient, public session: SessionService) { }
  title = 'kalani';
}
