import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
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
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarcodereaderService } from 'projects/@session/src/lib/barcodereader.service';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemberUploadPicComponent } from '../member-upload-pic/member-upload-pic.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Member } from 'projects/@models/src/lib/models';


@Component({
  selector: 'app-member-notes',
  standalone: true,
  imports: [
    CommonModule,
    // MaterialModule,
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
    FormsModule,
    EditorModule,
    EditorModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,  templateUrl: './member-notes.component.html',
  styleUrls: ['./member-notes.component.scss']
})
export class MemberNotesComponent implements OnInit, OnDestroy {
  Ready = false;
  Busy = false;
  quickEntry = false;
  // BarcodeDL: any;

  member! : Member;
  avatar = '';
  user = this.session.currentUser;
  memberForm!: FormGroup;
  membertypes: any[] = this.kalanisession.membertypes;
  insurancetypes: any[] = this.kalanisession.insurancetypes;
  membershiptypes: any[] = this.kalanisession.membershiptypes;
  notes?: string ;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;
  // @ViewChild('notes', { read: ElementRef }) notes?: ElementRef;


  constructor(
    private barCodeReader: BarcodereaderService,
    private dialogRef: MatDialogRef<MemberNotesComponent>,
    private FormBuilder: FormBuilder,

    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private session: SessionService,
    private kalanisession: KalaniSessionService,
    private db: DbservicesService,
    private notification: NotificationService,
    private dialog: MatDialog,

    private changeDetectorRef: ChangeDetectorRef,
  ) {
  
  }

  ngOnInit(): void {

 const defaultNote = `<p><strong>POINTS NOTES</strong></p>
 <p><strong>DP NOTES</strong></p>
 <p><strong>DURATION NOTES</strong></p>
 <p><strong>INS TYPE NOTES</strong></p>
 <p><strong>DP CC NOTES</strong></p>
 <p><strong>PAYMENT NOTES</strong></p>
 <p><strong>MONTHLY POINT NOTES</strong></p>` ;
      this.db.getMember({ id: this.dialogData.id }).subscribe({
        next: (json: any) => {
          this.member = {...json};
          this.notes = this.member!.notes! > '' ?  this.member.notes : defaultNote;
          this.avatar=json.avatar;
          this.Ready = true;
          this.changeDetectorRef.markForCheck();
          console.log(this.member);

        },
        error: (err: any) => {
          this.kalanisession.showErrorMsg(err);
          this.onClose();
        },
      });
    

  }
 
   
  getMemberTypeDesc() {
    const found = this.membertypes.find(
      (element) => element.type == this.member.membertype
    );
    if (found) return found.desc;
    return '';
  }
  onSave() {

 
    this.Busy=true;
    this.changeDetectorRef.markForCheck();

    this.db.saveMember({id: this.member.id, notes: this.notes}).subscribe({
      // this.db.saveXrayLog(toFormData (this.xrayLogForm.value)).subscribe({
      //  this.db.saveXrayLog( (this.xrayLogForm.value)).subscribe({
      next: (json: any) => {
        console.log(json);
        this.notification.notify(
          `Member: ${this.member.firstName} ${this.member.lastName} notes updated `
        );
        this.Busy=false;
        this.changeDetectorRef.markForCheck();


        this.onClose();
      },
      error: (err: any) => {
        this.Busy=false;
        this.changeDetectorRef.markForCheck();

        this.kalanisession.showErrorMsg(err);
      },
    });
  }

  onClose() {
    {
      this.dialogRef.close();
    }
  }
  ngOnDestroy(): void {
  }
}
