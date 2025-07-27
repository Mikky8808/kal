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
  isMobile = /Mobile/i.test(navigator.userAgent);
  form!: FormGroup;

  dataSource: any;
  lunches: any;
  Ptappts: any;
  accuMassages: any;
  massages: any;
  acupunctures: any;
  trips: any;
  showAllTrans: boolean = false;
  member?: Member | null;
  rideStatus: RideStatus[] = [];
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

  renewalPointsColumns = ['mbrshpStartDate', 'mbrshpEndDate', 'points'];
  renewalDPSColumns = ['mbrshpStartDate', 'mbrshpEndDate', 'daypass'];
  earnedPointsColumns = ['transactiondate', 'points'];
  earnedDPSColumns = ['transactiondate', 'daypass'];
  purchasedPointsColumns = ['transactiondate', 'amtpaid', 'points'];
  purchasedDPSColumns = ['transactiondate', 'amtpaid', 'daypass'];
  redeemedPointsColumns = ['transactiondate', 'points'];
  redeemedDPSColumns = ['transactiondate', 'daypass'];

  // Filtered data sets
  renewalPointsData: any[] = [];
  renewalDPSData: any[] = [];
  earnedPointsData: any[] = [];
  earnedDPSData: any[] = [];
  purchasedPointsData: any[] = [];
  purchasedDPSData: any[] = [];
  redeemedPointsData: any[] = [];
  redeemedDPSData: any[] = [];

  // Count variables
  renewalPointsCount = 0;
  renewalDPsCount = 0;
  earnedPointsCount = 0;
  earnedDPsCount = 0;
  purchasedPointsCount = 0;
  purchasedDPsCount = 0;
  redeemedPointsCount = 0;
  redeemedDPsCount = 0;

  // Visibility flags
  showRenewalPoints = false;
  showRenewalDPS = false;
  showEarnedPoints = false;
  showEarnedDPS = false;
  showPurchasedPoints = false;
  showPurchasedDPS = false;
  showRedeemedPoints = false;
  showRedeemedDPS = false;

  @Input() currentMember?: number;
  @Input() drawer: any;

  // Tab-specific separation variables
  renewalPoints = 0;
  renewalDPs = 0;
  earnedPoints = 0;
  earnedDPs = 0;
  purchasedPoints = 0;
  purchasedDPs = 0;
  redeemedPoints = 0;
  redeemedDPs = 0;

  // Yearly filtered data for tabs
  rides2023: any[] = [];
  rides2024: any[] = [];
  rides2025: any[] = [];
  accu2023: any[] = [];
  accu2024: any[] = [];
  accu2025: any[] = [];
  pt2023: any[] = [];
  pt2024: any[] = [];
  pt2025: any[] = [];

  constructor(
    private FormBuilder: FormBuilder,
    private db: DbservicesService,
    private changeDetectorRef: ChangeDetectorRef,
    public session: SessionService,
    private kalanisession: KalaniSessionService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.form = this.FormBuilder.group({
      id: [0],
      notes: [''],
    });

    this.getMember();
  }

  summarize(dataStore: any, field: string) {
    return dataStore.reduce(function (total: number, dataStore: any) {
      return total + (dataStore[field] || 0);
    }, 0);
  }

  calculateTabSeparations() {
    // Reset all
    this.renewalPoints = 0;
    this.renewalDPs = 0;
    this.earnedPoints = 0;
    this.earnedDPs = 0;
    this.purchasedPoints = 0;
    this.purchasedDPs = 0;
    this.redeemedPoints = 0;
    this.redeemedDPs = 0;

    // Renewal (MEMBERSHIP)
    if (this.dataSource?.renewal) {
      for (const tx of this.dataSource.renewal) {
        this.renewalPoints += tx.points || 0;
        this.renewalDPs += tx.daypass || 0;
      }
    }
    // Earned
    if (this.dataSource?.earn) {
      for (const tx of this.dataSource.earn) {
        this.earnedPoints += tx.points || 0;
        this.earnedDPs += tx.daypass || 0;
      }
    }
    // Purchased
    if (this.dataSource?.purchases) {
      for (const tx of this.dataSource.purchases) {
        this.purchasedPoints += tx.points || 0;
        this.purchasedDPs += tx.daypass || 0;
      }
    }
    // Redeemed
    if (this.dataSource?.redeem) {
      for (const tx of this.dataSource.redeem) {
        this.redeemedPoints += tx.points || 0;
        this.redeemedDPs += tx.daypass || 0;
      }
    }
  }

  getMember() {
    if (this.drawer) this.drawer.close();

    this.db
      .getMemberQV({ id: this.currentMember, showAll: this.showAllTrans })
      .subscribe({
        next: (json: any) => {
          this.dataSource = { ...json };
          this.member = this.dataSource.member;
          this.lunches = this.dataSource.lunch;
          this.Ptappts = this.dataSource.Ptappts;
          this.accuMassages = this.dataSource.accuMassages;
          this.trips = this.dataSource.trips;

          this.massages = this.dataSource.accuMassages?.filter(
            (element: any) => element.day !== 4
          );
          this.acupunctures = this.dataSource.accuMassages?.filter(
            (element: any) => element.day === 4
          );

          // Year filtering for Rides
          this.rides2023 = this.trips?.filter((t: any) => new Date(t.pickupDate).getFullYear() === 2023) || [];
          this.rides2024 = this.trips?.filter((t: any) => new Date(t.pickupDate).getFullYear() === 2024) || [];
          this.rides2025 = this.trips?.filter((t: any) => new Date(t.pickupDate).getFullYear() === 2025) || [];

          // Year filtering for Acupuncture
          this.accu2023 = this.acupunctures?.filter((a: any) => new Date(a.start).getFullYear() === 2023) || [];
          this.accu2024 = this.acupunctures?.filter((a: any) => new Date(a.start).getFullYear() === 2024) || [];
          this.accu2025 = this.acupunctures?.filter((a: any) => new Date(a.start).getFullYear() === 2025) || [];

          // Year filtering for Physical Therapy
          this.pt2023 = this.Ptappts?.filter((p: any) => new Date(p.start).getFullYear() === 2023) || [];
          this.pt2024 = this.Ptappts?.filter((p: any) => new Date(p.start).getFullYear() === 2024) || [];
          this.pt2025 = this.Ptappts?.filter((p: any) => new Date(p.start).getFullYear() === 2025) || [];

          // Process transaction data
          this.processTransactionData();
          
          // Calculate tab totals
          this.calculateTabSeparations();

          this.changeDetectorRef.markForCheck();
          if (this.drawer) this.drawer.open();
          setTimeout(() => {
            this.session.sideNaveState$.next(false);
          }, 350);
        },
        error: (err: any) => {
          this.kalanisession.showErrorMsg(err);
        },
      });
  }

  processTransactionData() {
    // Renewal
    this.renewalPointsData = this.dataSource.renewal?.filter((tx: any) => tx.points > 0) || [];
    this.renewalDPSData = this.dataSource.renewal?.filter((tx: any) => tx.daypass > 0) || [];
    this.renewalPointsCount = this.renewalPointsData.length;
    this.renewalDPsCount = this.renewalDPSData.length;
    this.showRenewalPoints = this.renewalPointsCount > 0;
    this.showRenewalDPS = this.renewalDPsCount > 0;

    // Earned
    this.earnedPointsData = this.dataSource.earn?.filter((tx: any) => tx.points > 0) || [];
    this.earnedDPSData = this.dataSource.earn?.filter((tx: any) => tx.daypass > 0) || [];
    this.earnedPointsCount = this.earnedPointsData.length;
    this.earnedDPsCount = this.earnedDPSData.length;
    this.showEarnedPoints = this.earnedPointsCount > 0;
    this.showEarnedDPS = this.earnedDPsCount > 0;

    // Purchased
    this.purchasedPointsData = this.dataSource.purchases?.filter((tx: any) => tx.points > 0) || [];
    this.purchasedDPSData = this.dataSource.purchases?.filter((tx: any) => tx.daypass > 0) || [];
    this.purchasedPointsCount = this.purchasedPointsData.length;
    this.purchasedDPsCount = this.purchasedDPSData.length;
    this.showPurchasedPoints = this.purchasedPointsCount > 0;
    this.showPurchasedDPS = this.purchasedDPsCount > 0;

    // Redeemed
    this.redeemedPointsData = this.dataSource.redeem?.filter((tx: any) => tx.points > 0) || [];
    this.redeemedDPSData = this.dataSource.redeem?.filter((tx: any) => tx.daypass > 0) || [];
    this.redeemedPointsCount = this.redeemedPointsData.length;
    this.redeemedDPsCount = this.redeemedDPSData.length;
    this.showRedeemedPoints = this.redeemedPointsCount > 0;
    this.showRedeemedDPS = this.redeemedDPsCount > 0;
  }

  onEditPoints(row: any) {
    this.dialog.open(MemberPointsComponent, {
      disableClose: true,
      maxWidth: 'calc(850px + 600px)',
      width: '100%',
      height: '100%',
      data: { ...row, type: 'points' },
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  onEditDPS(row: any) {
    this.dialog.open(MemberPointsComponent, {
      disableClose: true,
      maxWidth: 'calc(850px + 600px)',
      width: '100%',
      height: '100%',
      data: { ...row, type: 'dps' },
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  onShowMemberCard() {
    this.dialog.open(MemberCardComponent, {
      maxWidth: '800px',
      maxHeight: '100%',
      data: { ...this.member },
    });
  }

  onSendSms() {
    this.dialog.open(SmsQuickSendComponent, {
      maxWidth: '800px',
      maxHeight: '100%',
      data: { ...this.member },
    });
  }

  editAccMassageAppt(data: any) {
    this.dialog.open(AccuMassageApptEditComponent, {
      disableClose: true,
      maxWidth: '400px',
      maxHeight: '100%',
      data: { data },
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  printWholePage() {
    const section = document.getElementById('member-qv-print');
    if (!section) return;

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node: any) => node.outerHTML)
      .join('\n');

    const printStyles = `
      <style>
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #member-qv-print, .mat-card, .mat-elevation-z8, .mat-elevation-z6, .mat-card-content, .mat-card-actions {
            width: 100vw !important;
            max-width: 100vw !important;
            overflow: visible !important;
            box-shadow: none !important;
          }
          .mat-tab-group, .mat-tab-body-wrapper, .mat-tab-body-content {
            overflow: visible !important;
            height: auto !important;
          }
          table, .mat-table {
            page-break-inside: auto;
            width: 100% !important;
            max-width: 100% !important;
            display: table !important;
          }
          tr, td, th {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          .mat-row, .mat-header-row, .mat-footer-row {
            display: table-row !important;
          }
          .mat-cell, .mat-header-cell, .mat-footer-cell {
            display: table-cell !important;
          }
          .mat-tab-group {
            min-height: 0 !important;
          }
          .mat-tab-body-content {
            overflow: visible !important;
          }
          .toolbar, .mat-mini-fab, .mat-icon-button, .mat-fab, .mat-raised-button, .mat-button {
            display: none !important;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Member QuickView</title>
          ${styles}
          ${printStyles}
        </head>
        <body>
          ${section.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  editRide(data: any) {
    this.dialog.open(TripApptEditComponent, {
      disableClose: false,
      maxWidth: this.isMobile ? '100vw' : '600px',
      width: '800px',
      height: '100%',
      data: data,
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  editAppt(data: any) {
    this.dialog.open(PtApptEditComponent, {
      disableClose: true,
      maxWidth: '850px',
      width: '100%',
      height: '100%',
      data: { data },
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  onEditMember() {
    this.dialog.open(MemberEditComponent, {
      disableClose: true,
      maxWidth: '800px',
      width: '100%',
      height: '100%',
      data: { id: this.currentMember },
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  onAddNotes() {
    this.dialog.open(MemberNotesComponent, {
      disableClose: true,
      maxWidth: '800px',
      width: '100%',
      height: '100%',
      data: { id: this.currentMember },
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  openLunchDialog(data: any) {
    this.dialog.open(LunchEditApptComponent, {
      disableClose: true,
      maxWidth: '800px',
      maxHeight: '600px',
      data: { ...data },
    }).afterClosed().subscribe(() => {
      this.getMember();
    });
  }

  onCheckin(type: string, data: any) {
    this.db.checkInMember({ memberId: data.id, type: type }).subscribe({
      next: () => {},
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }

  closeDrawer() {
    if (this.drawer) this.drawer.close();
  }
}