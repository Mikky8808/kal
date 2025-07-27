import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MatDialog } from '@angular/material/dialog';

import { MemberCardComponent } from '../member-card/member-card.component';
import { SmsQuickSendComponent } from '../../sms/sms-quick-send/sms-quick-send.component';
import { MemberEditComponent } from '../member-edit/member-edit.component';
import { MemberNotesComponent } from '../member-notes/member-notes.component';
import { MemberPointsComponent } from '../member-points/member-points.component';

import { Member, pointTransaction } from 'projects/@models/src/lib/models';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-member-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonModule,
    JimgcardComponent,
  ],
  templateUrl: './member-menu.component.html',
  styleUrls: ['./member-menu.component.scss'],
})
export class MemberMenuComponent {
  constructor(
    private dialog: MatDialog,
    private db: DbservicesService,
    private kalanisession: KalaniSessionService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() member?: Member;
  @Input() minifab: boolean = false;
  @Output() public onSubmit = new EventEmitter();

  lastCheckinMember: any = null;

  allowedCheckin = ['M', 'C', 'P'];

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

  onEditMember() {
    const dialogRef = this.dialog.open(MemberEditComponent, {
      disableClose: true,
      maxWidth: '800px',
      width: '100%',
      height: '100%',
      data: { id: this.member!.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.onSubmit.emit(result);
    });
  }

  onAddNotes() {
    const dialogRef = this.dialog.open(MemberNotesComponent, {
      disableClose: true,
      maxWidth: '800px',
      width: '100%',
      height: '100%',
      data: { id: this.member!.id },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.onSubmit.emit(result);
    });
  }

  openMemberPoints(pointTran: pointTransaction) {
    const dialogRef = this.dialog.open(MemberPointsComponent, {
      disableClose: true,
      maxWidth: 'calc(850px + 600px)',
      width: '100%',
      height: '100%',
      data: pointTran,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.onSubmit.emit(result);
    });
  }

  onCheckin(type: string, data: any) {
    this.db.checkInMember({ memberId: data.id, type: type }).subscribe({
      next: (json: any) => {
        this.lastCheckinMember = json;
        setTimeout(() => {
          this.lastCheckinMember = null;
          this.changeDetectorRef.markForCheck();
        }, 4000);
        this.onSubmit.emit(json);
      },
      error: (err) => {
        this.kalanisession.notify(err);
      },
    });
  }

markDeceased() {
  if (!this.member?.id) return;
  if (!this.isAdmin) {
    this.kalanisession.notify('User not admin');
    return;
  }
  this.db
    .memberMarkDeceased({ memberId: Number(this.member.id) })
    .subscribe({
      next: () => {
        this.kalanisession.notify('Member marked as deceased');
        this.onSubmit.emit({ deceased: true, id: this.member?.id });
        (this.member as any).deceased = true;
        this.changeDetectorRef.markForCheck();
      },
      error: (err) => {
        this.kalanisession.notify(err);
      },
    });
}

confirmDeleteWithBrowserPrompt() {
  if (!this.member?.id) return;
  if (!this.kalanisession.currentUser?.isAdmin) {
    this.kalanisession.notify('User not admin');
    return;
  }
  if (window.confirm('Are you sure you want to permanently delete this member?')) {
    this.db.memberdelete({ memberId: Number(this.member.id) }).subscribe({
      next: (json: any) => {
        this.kalanisession.notify(json.message || 'Member deleted');
        this.onSubmit.emit({ deleted: true, id: this.member?.id }); // Notify parent to refresh list
      },
      error: (err) => {
        this.kalanisession.notify(err);
      },
    });
  }
}

 public get isAdmin(): boolean {
    return !!this.kalanisession.currentUser?.isAdmin;
  }

  private confirmDelete() {
    if (!this.member?.id) return;

    if (!this.kalanisession.currentUser?.isAdmin) {
      this.kalanisession.notify('User not admin');
      return;
    }

    this.db
      .memberdelete({
        memberId: this.member.id, // changed key to memberId
      })
      .subscribe({
        next: () => {
          this.kalanisession.notify('Member deleted');
          this.onSubmit.emit({ deleted: true, id: this.member?.id });
        },
        error: (err) => {
          this.kalanisession.notify(err);
        },
      });
  }
}
