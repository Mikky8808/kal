import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from 'projects/@session/src/public-api';
import { MediaMatcher } from '@angular/cdk/layout';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { BarcodereaderService } from 'projects/@session/src/lib/barcodereader.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'jimg-main-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatDatepickerModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatNativeDateModule,
    MatExpansionModule,
  ],
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css'],
})
export class MainNavComponent implements OnInit {
  @Input() sideMenuNav: any;

  isLoading?: boolean;
  mobileQuery: MediaQueryList;
  selectedDate: any;
  currentUser = this.session.currentUser;
  version='1.11';
  userAgent = navigator.userAgent;

  constructor(
    public session: SessionService,
    public barCodeReader: BarcodereaderService,
    public _router: Router,
    public db: DbservicesService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 800px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    this.session.isLoading$.subscribe({
      next: (isLoading) => {
        this.isLoading = isLoading;
      },
    });
  }
  ngOnInit(): void {}
  navigate(bar: any) {
    if (bar.href) {
      location.replace(bar.link);
    } else {
      this._router.navigate([bar.link]);
    }
  }

  private _mobileQueryListener: () => void;
  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
  onSelectDate(event: any) {
    this.selectedDate = event;
  }
  logoff() {
    this.db.logoff().subscribe({
      next: () => {
        this.session.Authenticated = false;

      },
      error: (err) => {
        // this.session.showErrorMsg(err);
      },
    });
  }
}
