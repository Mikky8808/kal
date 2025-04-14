import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbservicesService } from 'projects/@dbservices/src/public-api';

@Component({
  selector: 'app-pt-appt-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pt-appt-print.component.html',
  styleUrls: ['./pt-appt-print.component.scss'],
})
export class PtApptPrintComponent {
  constructor(
    private db: DbservicesService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @Output() public onAfterPrint = new EventEmitter();

  @Input() memberId?: number;
  dataSource: any;
  Ready = false;
  @ViewChild('page', { static: true }) printPage!: ElementRef;
  @ViewChild('printiframe', { static: false }) printIframe!: ElementRef;
  myStyle = `
<style #myStyles>
.item {font-size: 18px;
}
 
.page { page-break-after: always;  }
.page:last-child { page-break-after: avoid; } 

</style>`;
  ngOnInit() {
    this.db.getMemberApptForPrint({ memberId: this.memberId }).subscribe({
      next: (json: any) => {
        this.dataSource = json;
        this.Ready = true;
        this.changeDetectorRef.markForCheck();

        setTimeout(() => {
          this.printAppts();
        }, 3);
      },
      error: (err: any) => {
        console.log(err);
        this.Ready = true;
      },
    });
  }

  printAppts() {
    const iframeDoc =
      this.printIframe.nativeElement.contentDocument ||
      this.printIframe.nativeElement.contentWindow.document;

    iframeDoc.body.innerHTML =
      this.myStyle + this.printPage.nativeElement.innerHTML;

    var mediaQueryList =
      this.printIframe.nativeElement.contentWindow.matchMedia('print');
    mediaQueryList.addListener((mql: any) => {
      if (!mql.matches) {
        this.onAfterPrint.emit();
      }
    });

    setTimeout(() => {
      this.printIframe.nativeElement.contentWindow.print();
    }, 300);

    return '';
  }
}
