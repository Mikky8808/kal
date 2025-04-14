import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RideStatus, Trip } from 'projects/@models/src/lib/models';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { SessionService } from 'projects/@session/src/public-api';
import { MatListModule } from '@angular/material/list';
import { GooglemapurlPipe } from 'projects/@pipes/src/lib/googlemapurl.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Nl2brPipe } from 'projects/@pipes/src/lib/nl2br.pipe';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TripApptEditComponent } from '../trip-appt-edit/trip-appt-edit.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { SelectVehicleComponent } from 'projects/vmtracker/src/app/select-vehicle/select-vehicle.component';

@Component({
  selector: 'app-view-trip',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    GooglemapurlPipe,
    MatSelectModule,
    FormsModule,
    MatFormFieldModule,
    Nl2brPipe,
    MatButtonToggleModule,
    MatMenuModule,
  ],
  templateUrl: './view-trip.component.html',
  styleUrls: ['./view-trip.component.scss'],
})
export class ViewTripComponent implements OnInit, OnDestroy {
  trip?: any;
  ready = false;
  vehicles: any[] = this.kalanisession.vehicles;
  vehiclesOdometer: any;

  rideStatus = this.kalanisession.getRideStatus;
  isMobile = /Mobile/i.test(navigator.userAgent);

  constructor(
    private dialogRef: MatDialogRef<ViewTripComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialog: MatDialog,
    public db: DbservicesService,
    private kalanisession: KalaniSessionService
  ) {}
  ngOnInit(): void {
    this.getTrip();
  }
  getTrip() {
    this.db.getTrip({ id: this.dialogData.id }).subscribe({
      next: (json: Trip) => {
        if (!json) {
          this.kalanisession.notify('Ride not found!');
          this.onClose();
        }
        this.trip = { ...json };
        this.ready = true;
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
        this.onClose();
      },
    });
  }
  updateseStatus(value: any, id: any) {
    this.db.updateRideAppt({ id: id, seStatus: value }).subscribe({
      next: (json: any) => {
        this.kalanisession.notify('Appointment Status updated!');
        const found = this.rideStatus.find((element: any) => {
          return element.Status == value;
        });
        if (found?.phonecall) {
          const element: HTMLElement = document.getElementById(
            'phone'
          ) as HTMLElement;
          element.click();
        }
        if (found?.close) this.onClose();
        // this.onClose();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
  ngOnDestroy(): void {}

  onClose() {
    this.dialogRef.close();
  }
  VMTracker(vehicle: any) {
    const dialogRef = this.dialog.open(SelectVehicleComponent, {
      disableClose: false,
      maxWidth: '400px',
      maxHeight: '100vh',
      width: '100%',
      height: '100%',
      data: vehicle,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      this.vehiclesOdometer = result;
    });
  }
  editRide() {
    const dialogRef = this.dialog.open(TripApptEditComponent, {
      disableClose: false,
      maxWidth: '600px',
      maxHeight: '100vh',
      width: '100%',
      // height: '100%',
      data: { id: this.trip.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getTrip();
    });
  }
}
