import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { safeURL } from 'projects/@pipes/src/lib/safeurl.pipe';
import { MatIconModule } from '@angular/material/icon';
import { SessionService } from 'projects/@session/src/public-api';

@Component({
  selector: 'app-lunch-print',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './lunch-print.component.html',
  styleUrls: ['./lunch-print.component.scss'],
})
export class LunchPrintComponent implements AfterViewInit {
  @Output() public onAfterPrint = new EventEmitter();

  @Input() dataSource: any;
  groupedSource: any;
  @ViewChild('page', { static: true }) printPage!: ElementRef;
  @ViewChild('printiframe', { static: false }) printIframe!: ElementRef;
  dates?: any[] = [];
  mediaQueryList: any;
  onChange = (mql: any) => {
    if (!mql.matches) {
      this.onAfterPrint.emit();
    }
  };
  myStyle = `
<style #myStyles>
.item {font-size: 18px;
line-height: 5px;}
.material-icons {
  font-size: 18px;
}
.page { page-break-after: always;  }
.page:last-child { page-break-after: avoid; } 

</style>`;
  // myStyle = ``;

  constructor(public session: SessionService) {}
  ngOnInit() {
    this.groupedSource = this.groupBy(this.dataSource, 'start', this.dates);
  }

  groupBy(arr: any, property: any, dates: any) {
    return arr.reduce((memo: any, x: any) => {
      if (!memo[x[property]]) {
        memo[x[property]] = [];
        dates.push(x[property]);
      }
      if (x.status != 99) memo[x[property]].push(x);
      return memo;
    }, {});
  }

  ngAfterViewInit() {
    // const iframe = document.querySelector('iframe');

    this.session.PrintIframe(
      this.myStyle + this.printPage.nativeElement.innerHTML,
      () => {
        this.onAfterPrint.emit();
      }
    );

    return;

    // const iframe = document.querySelector('iframe');

    // const printIframe = this.session.iframePrint;
    // const iframeDoc = this.session.iframePrint.contentDocument;

    // if (!printIframe || !iframeDoc || !printIframe.contentWindow )  {
    //   this.onAfterPrint.emit();
    //   return;
    // }

    // iframeDoc.body.innerHTML =
    //   this.myStyle + this.printPage.nativeElement.innerHTML;

    // this.mediaQueryList = printIframe.contentWindow.matchMedia('print');
    // console.log(this.mediaQueryList);

    // this.mediaQueryList.addEventListener('change', this.onChange);

    // printIframe.contentWindow.print();
  }

  ngOnDestroy(): void {
    // this.mediaQueryList.removeEventListener('change', this.onChange);
  }
}
