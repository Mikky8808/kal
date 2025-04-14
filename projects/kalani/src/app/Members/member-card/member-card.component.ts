import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Member } from 'projects/@models/src/lib/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    JimgcardComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss'],
})
export class MemberCardComponent implements OnInit, OnDestroy {
  @ViewChild('membercard', { static: true }) membercard!: ElementRef;
  @ViewChild('printIframe', { static: false }) printIframe!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MemberCardComponent>,
    @Inject(MAT_DIALOG_DATA) public member: Member
  ) {}
  ngOnInit(): void {
  }
  ngOnDestroy(): void {}

  printCard() {
    const iframeDoc =
      this.printIframe.nativeElement.contentDocument ||
      this.printIframe.nativeElement.contentWindow.document;

    iframeDoc.body.innerHTML =
      `<style>
      body {padding: 0px;}
       @page {
        size: 3.375in 2.10in;
        margin: 0px;
      }</style>` +
      this.membercard.nativeElement.innerHTML;
    setTimeout(() => {
      this.printIframe.nativeElement.contentWindow.print();
    }, 300);
  }
}
