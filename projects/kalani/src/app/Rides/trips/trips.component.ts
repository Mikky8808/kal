import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SessionService } from 'projects/@session/src/public-api';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { interval, Subject, Subscription, takeUntil } from 'rxjs';
import { RideStatus, Trip } from 'projects/@models/src/lib/models';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { ViewTripComponent } from './view-trip/view-trip.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

declare var document: any;

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    JimgcardComponent,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatBadgeModule,
    MatDividerModule,
    FormsModule,
  ],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss'],
})

export class TripsComponent implements OnInit, OnDestroy {
  isMobile = /Mobile/i.test(navigator.userAgent);

  intervalAmt = 30000;
  Ready = false;
  TripDate = new Date();
  currentUser = this.session.currentUser;
  pending: Trip[] = [];
  processed: Trip[] = [];
  currentDriver = this.session.currentUser.username;
  selectedDriver = '';
  drivers = this.kalanisession.Drivers;

  rideStatus: RideStatus[] = this.kalanisession.getRideStatus;

  Drivers = this.kalanisession.Drivers;

  private destroy$ = new Subject();

  displayedDoneColumns: string[] = ['id', 'pickupDate', 'name',  'phone'];
  displayedColumns: string[] = [];

  DoneTripContext : any = {
    dataSource: [],
    displayedColumns: ['id', 'name', 'pickupDate', 'phone'],
  };

  // displayedColumns: string[] = ['id', 'name', 'pickupDate', 'phone','driver'];

  constructor(
    public db: DbservicesService,
    private dialog: MatDialog,
    public route: ActivatedRoute,
    public kalanisession: KalaniSessionService,
    private session: SessionService,
    public _router: Router
  ) {}
  ngOnInit(): void {
    if (this.currentUser.isAdmin) {
      this.displayedColumns = [

        'id',        'pickupDate',

        'name',
        'phone',
        'assignDriver',
      ];
    } else {
      this.displayedColumns = ['id',  'pickupDate', 'name','phone'];
    }

    if (this.route.snapshot.paramMap.get('date')) {
      const date: any = this.route.snapshot.paramMap.get('date')?.split('-');
      this.TripDate = new Date(
        parseInt(date[0]),
        parseInt(date[1]) - 1,
        parseInt(date[2])
      );
    }

    this.getDayTrips();

    this._router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          const date = this.route.snapshot.paramMap.get('date');
          this.getDayTrips();
        }
      });

    const interval$ = interval(this.intervalAmt);
    interval$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      const now = new Date();

      if (
        document.visibilityState === 'visible' &&
        this.dateFormatYYYY_MM_DD(this.TripDate) ==
          this.dateFormatYYYY_MM_DD(now)
      ) {
        this.getDayTrips();
      }
    });
  }

  getDayTrips() {
    this.db
      .getDayTrips({ date: this.dateFormatYYYY_MM_DD(this.TripDate) })
      .subscribe({
        next: (json: Trip[]) => {
          this.pending = [];
          this.processed = [];
          this.Ready = true;
          this.DoneTripContext.dataSource =  [];
            console.log(json);

          json.forEach((element: Trip) => {
            if (
              this.selectedDriver.trim() == '' ||
              element.driver == this.selectedDriver
            ) {
              if (element?.seStatus < '3') {
                this.pending.push(Object.assign({}, element));
              } else {
                this.DoneTripContext.dataSource.push(Object.assign({}, element));

                this.processed.push(Object.assign({}, element));
              }
            }
          });
        },
        error: (err) => {
          this.kalanisession.showErrorMsg(err);
          this.Ready = true;
        },
      });
  }

  dateFormatYYYY_MM_DD(date: Date) {
    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return year + '-' + month + '-' + day;
  }

  navDate(days: number) {
    // if (days < 0) days++;
    this.TripDate.setDate(this.TripDate.getDate() + days);
    this.TripDate = new Date(this.TripDate.toISOString());

    const year = this.TripDate.getFullYear();
    const day = String(this.TripDate.getDate()).padStart(2, '0');
    const month = String(this.TripDate.getMonth() + 1).padStart(2, '0');

    this._router.navigate([
      'trips',
      this.dateFormatYYYY_MM_DD(this.TripDate),
      //  year + '-'+month+'-'+day,
    ]);
  }
  assignRideDriver(e: any, tripId: number) {
    this.db.assignDriver({ id: tripId, driver: e.value }).subscribe({
      next: (json: Trip[]) => {
        this.kalanisession.notify(
          `Trip ${tripId} assigned to driver ${e.value}`
        );
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
  onTripClick(element: any) {
    const dialogRef = this.dialog.open(ViewTripComponent, {
      disableClose: true,
      maxWidth: '650px',
      maxHeight: '100vh',
      // width: '800px',
      // height: '100%',
      // height: this.isMobile ? '100vh' : '',
      data: { ...element },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getDayTrips();
    });
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
