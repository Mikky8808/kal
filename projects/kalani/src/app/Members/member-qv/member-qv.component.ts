import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Member,
  RideStatus,
  pointTransaction,
} from 'projects/@models/src/lib/models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from 'projects/@session/src/public-api';
import { MemberEditComponent } from '../member-edit/member-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { MemberCardComponent } from '../member-card/member-card.component';
import { PtApptEditComponent } from '../../healthspring/pt-appt-edit/pt-appt-edit.component';
import { TripApptEditComponent } from '../../Rides/trips/trip-appt-edit/trip-appt-edit.component';
import { SmsQuickSendComponent } from '../../sms/sms-quick-send/sms-quick-send.component';
import { AccuMassageApptEditComponent } from '../../kalani/accu-massage-appts/accu-massage-appt-edit/accu-massage-appt-edit.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { LunchEditApptComponent } from '../../kalani/lunch-dash-board/lunch-edit-appt/lunch-edit-appt.component';
import { MemberNotesComponent } from '../member-notes/member-notes.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MemberPointsComponent } from '../member-points/member-points.component';
import { MemberMenuComponent } from '../member-menu/member-menu.component';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-member-qv',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    MatTableModule,
    JimgcardComponent,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatInputModule,
    MemberMenuComponent,
    MatListModule,
  ],
  templateUrl: './member-qv.component.html',
  styleUrls: ['./member-qv.component.scss'],
})
export class MemberQVComponent {
  constructor(
    private kalanisession: KalaniSessionService,
    private db: DbservicesService,
    public session: SessionService,
    private FormBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,

    private dialog: MatDialog
  ) {}
  isMobile = /Mobile/i.test(navigator.userAgent);
  form!: FormGroup;

  dataSource: any;
  lunches: any;
  Ptappts: any;
  accuMassages: any;
  acupunctures: any;
  earned: any;
  massages: any;
  redeem: any;
  purchases: any;
  trips: any;
  showAllTrans: boolean = false;
  pointTypes = [
    {
      type: 'MEMBERSHIP',
      label: 'Renewal',
      source: 'renewal',
      displayColumns: [
        'mbrshpStartDate',
        'mbrshpEndDate',
        'description',
        'amtpaid',
        'daypass',
        'points',
        'notes',
      ],
    },
    {
      type: 'PURCHASE',
      label: 'Purchase Points',
      source: 'purchases',
      displayColumns: [
        'transactiondate',
        'description',
        'amtpaid',
        'daypass',
        'points',
        'notes',
      ],
    },
    {
      type: 'EARN',
      label: 'Earned Points',
      source: 'earn',
      displayColumns: [
        'transactiondate',
        'description',
        'daypass',
        'points',
        'notes',
      ],
    },
    {
      type: 'REDEEM',
      label: 'Reedem Points',
      source: 'redeem',
      displayColumns: [
        'transactiondate',
        'description',
        'daypass',
        'points',
        'notes',
      ],
    },
  ];

  member?: Member | null;
  rideStatus: RideStatus[] = this.kalanisession.getRideStatus;
  allowedCheckin = ['M', 'C', 'P'];

  PtDisplayedColumns: string[] = [
    'apptDateTime',
    'apptTime',
    'duration',
    'PTStaff',
  ];
  pointsDisplayedColumns: string[] = [
    'tran_type',
    'totPoints',
    'totPendPoints',
    'totdaypass',
    'totPenddaypass',
  ];

  TripsDisplayedColumns: string[] = ['name', 'pickupDate'];

  @Input() currentMember?: number;
  @Input() drawer: any;

  ngOnInit() {
    this.form = this.FormBuilder.group({
      id: [0],
      notes: [''],
    });

    this.getMember();
  }
  closeDrawer() {
    this.drawer.close();
    setTimeout(() => {
      this.session.sideNaveState$.next(false);
    }, 350);
  }

  summarize(dataStore: any, field: string) {
    return dataStore.reduce(function (total: number, dataStore: any) {
      return total + dataStore[field];
    }, 0);
  }

  getMember() {
    this.drawer.close();

    this.db
      .getMemberQV({ id: this.currentMember, showAll: this.showAllTrans })
      .subscribe({
        next: (json: any) => {
          this.dataSource = { ...json };
          console.log(json);
          this.member = this.dataSource.member;
          this.lunches = this.dataSource.lunch;
          this.Ptappts = this.dataSource.Ptappts;
          this.accuMassages = this.dataSource.accuMassages;
          // this.earned = this.dataSource.earned;
          // this.purchases = this.dataSource.purchases;
          this.trips = this.dataSource.trips;
          // this.redeem = this.dataSource.redeem;

          this.massages = this.dataSource.accuMassages.filter(
            (element: any) => {
              return element.day !== 4;
            }
          );
          this.acupunctures = this.dataSource.accuMassages.filter(
            (element: any) => {
              return element.day === 4;
            }
          );
          // this.form.controls['id'].patchValue(this.member?.id);
          // this.form.controls['notes'].patchValue(this.member?.notes);

          this.changeDetectorRef.markForCheck();
          this.drawer.open();
          setTimeout(() => {
            this.session.sideNaveState$.next(false);
          }, 350);
        },
        error: (err) => {
          this.kalanisession.showErrorMsg(err);
        },
      });
  }

  onShowMemberCard() {
    const dialogRef = this.dialog.open(MemberCardComponent, {
      // disableClose: true,
      maxWidth: '800px',
      maxHeight: '100%',
      // width: '100%',
      // height: '100%',
      data: { ...this.member },
    });
  }
  onSendSms() {
    const dialogRef = this.dialog.open(SmsQuickSendComponent, {
      // disableClose: true,
      maxWidth: '800px',
      maxHeight: '100%',
      // width: '100%',
      // height: '100%',
      data: { ...this.member },
    });
  }
  editAccMassageAppt(data: any) {
    const dialogRef = this.dialog.open(AccuMassageApptEditComponent, {
      disableClose: true,
      maxWidth: '400px',
      maxHeight: '100%',
      // width: '100%',
      // height: '100%',
      data: { data },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMember();
    });
  }

  editRide(data: any) {
    const dialogRef = this.dialog.open(TripApptEditComponent, {
      disableClose: false,
      maxWidth: this.isMobile ? '100vw' : '600px',
      width: '800px',
      height: '100%',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMember();
    });
  }

  editAppt(data: any) {
    const dialogRef = this.dialog.open(PtApptEditComponent, {
      disableClose: true,
      maxWidth: '850px',
      // maxHeight: '100vh',
      width: '100%',
      height: '100%',
      data: { data },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMember();
    });
  }
  onEditMember() {
    const dialogRef = this.dialog.open(MemberEditComponent, {
      disableClose: true,
      maxWidth: '800px',
      // maxHeight: '100vh',
      width: '100%',
      height: '100%',
      data: { id: this.currentMember },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMember();
    });
  }
  onAddNotes() {
    const dialogRef = this.dialog.open(MemberNotesComponent, {
      disableClose: true,
      maxWidth: '800px',
      // maxHeight: '100vh',
      width: '100%',
      height: '100%',
      data: { id: this.currentMember },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMember();
    });
  }
  openLunchDialog(data: any) {
    const dialogRef = this.dialog.open(LunchEditApptComponent, {
      disableClose: true,
      maxWidth: '800px',
      maxHeight: '600px',
      // width: '100%',
      // height: '100%',
      data: { ...data },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMember();
    }); // calendarApi.unselect(); // clear date selection
  }
  openMemberPoints(pointTran: pointTransaction) {
    const dialogRef = this.dialog.open(MemberPointsComponent, {
      disableClose: true,
      maxWidth: 'calc(850px + 600px)',
      // maxHeight: '100%',
      // width: '850px',
      width: '100%',

      height: '100%',
      data: pointTran,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMember();
    });
  }

  onCheckin(type: string, data: any) {
    this.db.checkInMember({ memberId: data.id, type: type }).subscribe({
      next: (json: any) => {},
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
}
