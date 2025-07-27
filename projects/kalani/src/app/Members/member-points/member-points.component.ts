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
  pointMethods: any[] = this.kalanisession.pointMethods;
  displayedColumns: string[] = [
    'transactiondate',
    'description',
    'daypass',
    'points',
    'notes',
  ];
  HEADING = {
    MEMBERSHIP: 'Renewal',
    EARN: 'Earn',
    PURCHASE: 'Purchase',
    REDEEM: 'Reedem',
  };

  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;
  @ViewChild('drawer', { static: false }) matDrawer!: MatDrawer;

  isPoints = false;
  isDps = false;

  constructor(
    @Optional() private dialogRef: MatDialogRef<MemberPointsComponent>,
    private FormBuilder: FormBuilder,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public pointTransaction: pointTransaction,
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

    this.displayedColumns = [
      'transactiondate',
      'description',
      'daypass',
      'points',
      'notes',
    ];

  // These flags are set based on dialog data passed from MemberQVComponent
this.isPoints = this.pointTransaction?.type === 'points';
this.isDps = this.pointTransaction?.type === 'dps';

    if (this.pointTransaction?.tran_type === 'MEMBERSHIP') {
      this.requireAmt = true;
      this.requireMbrshpDate = true;
    }
    if (this.pointTransaction?.tran_type === 'PURCHASE') {
      this.requireAmt = true;
    }

    if (this.pointTransaction?.tran_type === 'MEMBERSHIP') {
      this.displayedColumns.splice(
        1,
        0,
        'mbrshpStartDate',
        'mbrshpEndDate',
        'amtpaid'
      );
    }
    if (this.pointTransaction?.tran_type === 'PURCHASE') {
      this.displayedColumns.splice(1, 0, 'amtpaid');
    }

    this.db.getAllPointTrans(this.pointTransaction).subscribe({
      next: (json: any) => {
        this.dataSource = json.pointTrans;
        this.member = json.member;
        this.avatar = json.member.avatar;
        this.setupForm({ memberId: this.member.memberId });

        if (this.pointTransaction?.id && this.pointTransaction.id > 0) {
          const found = this.dataSource.find(
            (element: any) => element.id == this.pointTransaction.id
          );
          if (found) this.setupForm(found);
        }
        if (!this.session.isMobile) this.matDrawer.open();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
        this.onClose();
      },
    });
  }

onTableInputChange(event: Event, element: any, field: 'points' | 'daypass') {
  const input = event.target as HTMLInputElement;
  element[field] = input.valueAsNumber;
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
      type: [this.pointTransaction?.type || (this.isPoints ? 'points' : this.isDps ? 'dps' : undefined)]
    });

    if (!this.requireAmt) this.memberForm.get('amtpaid')?.disable();
    if (!this.requireMbrshpDate) {
      this.memberForm.get('mbrshpStartDate')?.disable();
      this.memberForm.get('mbrshpEndDate')?.disable();
    }

    // Enable/disable fields based on transaction type
    if (this.isPoints) {
      this.memberForm.get('points')?.enable();
      this.memberForm.get('daypass')?.disable();
    } else if (this.isDps) {
      this.memberForm.get('daypass')?.enable();
      this.memberForm.get('points')?.disable();
    } else {
      // If neither, enable both (menu access)
      this.memberForm.get('points')?.enable();
      this.memberForm.get('daypass')?.enable();
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
    if (this.memberForm.invalid) {
      return;
    }

    this.Busy = true;
    this.changeDetectorRef.markForCheck();

    const formData = {
      ...this.memberForm.value,
      type: this.pointTransaction?.type || (this.isPoints ? 'points' : this.isDps ? 'dps' : undefined)
    };

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