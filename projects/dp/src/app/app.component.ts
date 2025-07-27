import { Component } from '@angular/core';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { SessionService } from 'projects/@session/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private session: SessionService){
  }
  title = 'kalaniadmin';
  ngOnInit (){

  }
}
