import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { JmcbootService } from 'projects/@jmcboot/src/lib/jmcboot.service';
import { ShowErrorComponent } from 'projects/@components/src/lib/show-error/show-error.component';
import { ErrormessageService } from './errormessage.service';
import { NotificationService } from './notification.service';
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(
    public boot: JmcbootService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private _showerror: ErrormessageService,
    private notification: NotificationService
  ) {}
  // durationInSeconds = 35;

  public iframePrint: HTMLIFrameElement = this._createPrintIrame();

  public sideNaveState$ = new Subject<any>();

  public isLoading$: Subject<boolean> = new Subject<boolean>();

  get isMobile () {
  return  /Mobile/i.test(navigator.userAgent);
  }

  get Authenticated() {
    return this.boot.config?.Authenticated;
  }
  set Authenticated(val) {
    this.boot.config!.Authenticated = val;
  }
  set bootdata(val: any) {
    this.boot.config!.bootdata = val;
  }
  get bootdata() {
    return this.boot.config!.bootdata;
  }
  get currentUser() {
    return this.boot.config?.bootdata?.user;
  } 
  private _createPrintIrame() {
    const iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'white';
    iframe.style.position = 'fixed';
    iframe.style.visibility = 'hidden'; 
    iframe.style.height='100%';
    iframe.style.width='100%';
    iframe.style.left = '0';
    iframe.style.zIndex = '9990';

    document.body.appendChild(iframe);
    if (iframe.contentDocument) {
      const link = iframe.contentDocument.createElement('link');

      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      iframe.contentDocument.head.appendChild(link);
      iframe.contentDocument.body.innerHTML = `
<mat-icon class="mat-icon notranslate material-icons mat-ligature-font 
mat-icon-no-color"  data-mat-icon-type="font">schedule</mat-icon>
`;
    }
    return iframe;
  }

  PrintIframe(content: any, callback?: () => void): void {
    {
    }
    const printIframe = this.iframePrint;
    const iframeDoc = this.iframePrint.contentDocument;

    if (!printIframe || !iframeDoc || !printIframe.contentWindow) {
      if (callback) {
        callback();
      }
      return;
    }

    iframeDoc.body.innerHTML = content;

    const mediaQueryList = printIframe.contentWindow.matchMedia('print');

    mediaQueryList.addEventListener('change', (mql: any) => {
      if (!mql.matches) {
        if (callback) {
          callback();
          iframeDoc.body.innerHTML = '';

        }
      }
    });

    printIframe.contentWindow.print();
  }

  

  getToken() {
    return localStorage.getItem('token');
  }
  showErrorMsg(error: any) {
    this._showerror.showErrorMsg(error);
  }
  notify(msg: string) {
    this.notification.notify(msg);
  }
}
