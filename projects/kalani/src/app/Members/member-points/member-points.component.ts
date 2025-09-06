
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  Optional,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SessionService } from 'projects/@session/src/public-api';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from 'projects/@session/src/lib/notification.service';
import { PhoneMaskDirective } from 'projects/@directives/src/lib/phone-mask.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { pointTransaction } from 'projects/@models/src/lib/models';
import { DialogConfirmComponent } from '../../dialog/dialog-confirm/dialog-confirm.component';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { format } from 'date-fns';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';

export type TranType = "MEMBERSHIP" | "REDEEM" | "EARN" | "PURCHASE" | "PURCHASEITEM";

@Component({
  selector: 'app-member-points',
  standalone: true,
  imports: [
    CommonModule,
    MemlookupComponent,
    JimgcardComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    PhoneMaskDirective,
    MatTableModule,
    MatSidenavModule,
    MatMenuModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './member-points.component.html',
  styleUrls: ['./member-points.component.scss'],
})

export class MemberPointsComponent implements OnInit, OnDestroy {
  Ready = false;
  Busy = false;
  dataSource: any;
  avatar = '';
  member: any;
  searchMember = new FormControl('');
  memberForm!: FormGroup;
  requireAmt = false;
  requireMbrshpDate = false;
  isDps: boolean = false;
  isPoints: boolean = false;
  pointMethods: any[] = this.kalanisession.pointMethods;
  displayedColumns: string[] = [];
  HEADING = {
    MEMBERSHIP: 'Renewal',
    EARN: 'Earn',
    PURCHASE: 'Purchase',
    PURCHASEITEM: 'Purchase Item',
    REDEEM: 'Reedem',
  };

  purchaseItemOptions = [
    { value: 'Lunch pass', label: 'Lunch pass' },
    { value: 'Herbal products', label: 'Herbal products' },
    { value: 'Amazon order', label: 'Amazon order' },
    { value: 'Other', label: 'Other' }
  ];

  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;
  @ViewChild('drawer', { static: false }) matDrawer!: MatDrawer;

  constructor(
    @Optional() private dialogRef: MatDialogRef<MemberPointsComponent>,
    private FormBuilder: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public pointTransaction: pointTransaction,
    private kalanisession: KalaniSessionService,
    private session: SessionService,
    private db: DbservicesService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.requireMbrshpDate = false;
    this.requireAmt = false;

    // Set displayedColumns based on transaction type
  
    // 1. Set default columns
this.displayedColumns = [
  'transactiondate',
  'description',
  'daypass',
  'points',
  'notes',
];

// 2. Get transaction type
const tranType = this.pointTransaction.tran_type;

// 3. Modify flags and columns based on transaction type
if (tranType === 'MEMBERSHIP') {
  this.requireAmt = true;
  this.requireMbrshpDate = true;

  // Insert membership-specific columns after transactiondate
  this.displayedColumns.splice(
    1,
    0,
    'mbrshpStartDate',
    'mbrshpEndDate',
    'amtpaid'
  );

} else if (tranType === 'PURCHASE') {
  this.requireAmt = true;

  // Insert amtpaid after transactiondate
  this.displayedColumns.splice(1, 0, 'amtpaid');

} else if (tranType === 'PURCHASEITEM') {
  this.requireAmt = true;

  // Insert amtpaid after transactiondate
  this.displayedColumns.splice(1, 0, 'amtpaid');

  // Find index of amtpaid and insert 'item' after it
  const amtpaidIndex = this.displayedColumns.indexOf('amtpaid');
  if (amtpaidIndex !== -1) {
    this.displayedColumns.splice(amtpaidIndex + 1, 0, 'item');
  }
}



    this.db.getAllPointTrans(this.pointTransaction).subscribe({
      next: (json: any) => {
        this.dataSource = json.pointTrans;
        this.member = json.member;
        this.avatar = json.member.avatar;
        this.setupForm({ memberId: this.member.memberId });

        if (this.pointTransaction?.id! > 0) {
          const found = this.dataSource.find(
            (element: any) => element.id == this.pointTransaction.id
          );
          if (found) this.setupForm(found);
        }
        if (!this.session.isMobile && this.matDrawer) this.matDrawer.open();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
        this.onClose();
      },
    });
  }


  
  onMemberChanged(member: any) {
    this.pointTransaction.memberId = member.id;
    this.pointTransaction.id = null;
    this.ngOnInit();
  }

  newMemberPoints(pointTran: pointTransaction) {
    pointTran.memberId = this.member.memberId;
    this.pointTransaction = pointTran;
    this.ngOnInit();
  }

  setupForm(rec: any) {
    this.Ready = true;

    if (this.pointTransaction.tran_type === 'PURCHASEITEM') {
      this.memberForm = this.FormBuilder.nonNullable.group({
        id: rec?.id,
        tran_type: this.pointTransaction.tran_type,
        memberId: rec?.memberId,
        transactiondate: [
          rec?.transactiondate
            ? rec?.transactiondate
            : format(Date.now(), 'yyyy-MM-dd'),
          Validators.required,
        ],
        amtpaid: [rec?.amtpaid, Validators.required],
        method: [rec?.method, Validators.required],
        item: [rec?.item || '', Validators.required],
        otherItem: [''],
        notes: [rec?.notes],
      });
    } else {
      this.memberForm = this.FormBuilder.nonNullable.group({
        id: rec?.id,
        tran_type: this.pointTransaction.tran_type,
        memberId: rec?.memberId,
        transactiondate: [
          rec?.transactiondate
            ? rec?.transactiondate
            : format(Date.now(), 'yyyy-MM-dd'),
          Validators.required,
        ],
        amtpaid: [rec?.amtpaid, Validators.required],
        method: [rec?.method, Validators.required],
        daypass: [rec?.daypass ? rec.daypass : 0, Validators.required],
        points: [rec?.points ? rec.points : 0, Validators.required],
        mbrshpStartDate: [rec?.mbrshpStartDate, Validators.required],
        mbrshpEndDate: [rec?.mbrshpEndDate, Validators.required],
        notes: [rec?.notes],
      });
    }

    if (!this.requireAmt) this.memberForm.get('amtpaid')?.disable();
    if (!this.requireMbrshpDate) {
      this.memberForm.get('mbrshpStartDate')?.disable();
      this.memberForm.get('mbrshpEndDate')?.disable();
    }

    this.changeDetectorRef.markForCheck();
  }

  onEdit(member: any) {
    this.setupForm(member);
  }
  onSave() {
    this.submitButton?.nativeElement.click();
  }

  onSubmit() {
    this.Busy = true;
    this.changeDetectorRef.markForCheck();

    let formData = this.memberForm.value;
    if (this.pointTransaction.tran_type === 'PURCHASEITEM') {
      formData = {
        ...formData,
        item: formData.item === 'Other' ? formData.otherItem : formData.item,
      };
    }

    this.db.savePointTrans(formData).subscribe({
      next: (json: any) => {
        this.notification.notify(
          `Member: ${this.member.fullName} Transaction added/updated`
        );
        this.dataSource = json.pointTrans;

        this.Ready = false;
        this.Busy = false;
        this.changeDetectorRef.markForCheck();

        setTimeout(() => {
          this.memberForm.reset();
          this.setupForm({ memberId: this.member.memberId });
        }, 50);
      },
      error: (err: any) => {
        this.Busy = false;
        this.changeDetectorRef.markForCheck();
        this.kalanisession.showErrorMsg(err);
      },
    });
  }

// ...existing code...

printTableAndNotes() {
  const printContents = document.getElementById('print-section')?.innerHTML;
  if (printContents) {
    const win = window.open('', '', 'height=900,width=1200');
    win?.document.write('<html><head><title>Print</title>');
    win?.document.write(`
      <style>
        body { font-family: sans-serif; }
        .print-notes { page-break-after: always; }
        .print-table { page-break-before: always; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 4px; }
        @media print {
          .print-notes { page-break-after: always; }
          .print-table { page-break-before: always; }
        }
      </style>
    `);
    win?.document.write('</head><body>');
    win?.document.write(printContents);
    win?.document.write('</body></html>');
    win?.document.close();
    win?.focus();
    setTimeout(() => win?.print(), 300);
  }
}
// ...existing code...
  
  onDelete() {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { title: 'Confirm to Delete...' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const data = {
          id: this.memberForm.value.id,
          memberId: this.member.memberId,
          tran_type: this.pointTransaction.tran_type,
        };

        this.db.deletePointTrans(data).subscribe({
          next: (json: any) => {
            this.notification.notify(
              `Member: ${this.member.fullName} Points deleted`
            );
            this.setupForm({ memberId: this.member.memberId });
            this.dataSource = json.pointTrans;
            this.changeDetectorRef.markForCheck();
          },
          error: (err: any) => {
            this.kalanisession.showErrorMsg(err);
          },
        });
      }
    });
  }

  onClose() {
    this.dialogRef?.close();
  }
  ngOnDestroy(): void {}
}