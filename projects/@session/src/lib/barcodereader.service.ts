import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ErrormessageService } from './errormessage.service';

export class LineBreakTransformer {
  chunks: any = '';

  constructor() {
    // A container for holding stream data until a new line.
    this.chunks = '';
  }

  transform(chunk: any, controller: any) {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines: any = this.chunks.split('\t');
    this.chunks = lines.pop();
    lines.forEach((line: any) => controller.enqueue(line));
  }

  flush(controller: any) {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}
declare const navigator: any;

@Injectable({
  providedIn: 'root',
})
export class BarcodereaderService {
  constructor(public session: ErrormessageService) {}
  public BarCodeDL$ = new Subject<any>();
  public BarCodeDMemberId$ = new Subject<any>();

  private myValue: any;
  public barcodeReaderNotConnected = false;
  CodeToKey: any = {
    // 'DCT': 'firstNameAndMiddleName',
    // 'DCA': 'jurisdictionVehicleClass',
    // 'DCB': 'jurisdictionRestrictionCodes',
    // 'DCD': 'jurisdictionEndorsementCodes',
    // 'DBA': 'dateOfExpiry',
    DCS: 'lastName',
    DAC: 'firstName',
    DAD: 'middleName',
    // 'DBD': 'dateOfIssue',
    DBB: 'DOB',
    DBC: 'legalSex',
    // 'DAY': 'eyeColor',
    // 'DAU': 'height',
    DAG: 'address',
    DAI: 'city',
    DAJ: 'state',
    DAK: 'zipCode',
    DAQ: 'DL',
    // 'DCF': 'documentDiscriminator',
    // 'DCG': 'issuer',
    // 'DDE': 'lastNameTruncated',
    // 'DDF': 'firstNameTruncated',
    // 'DDG': 'middleNameTruncated',
    // // optional
    // 'DAZ': 'hairColor',
    // 'DAH': 'addressStreet2',
    // 'DCI': 'placeOfBirth',
    // 'DCJ': 'auditInformation',
    // 'DCK': 'inventoryControlNumber',
    // 'DBN': 'otherLastName',
    // 'DBG': 'otherFirstName',
    // 'DBS': 'otherSuffixName',
    // 'DCU': 'nameSuffix', // e.g. jr, sr
    // 'DCE': 'weightRange',
    // 'DCL': 'race',
    // 'DCM': 'standardVehicleClassification',
    // 'DCN': 'standardEndorsementCode',
    // 'DCO': 'standardRestrictionCode',
    // 'DCP': 'jurisdictionVehicleClassificationDescription',
    // 'DCQ': 'jurisdictionEndorsementCodeDescription',
    // 'DCR': 'jurisdictionRestrictionCodeDescription',
    // 'DDA': 'complianceType',
    // 'DDB': 'dateCardRevised',
    // 'DDC': 'dateOfExpiryHazmatEndorsement',
    // 'DDD': 'limitedDurationDocumentIndicator',
    // 'DAW': 'weightLb',
    // 'DAX': 'weightKg',
    // 'DDH': 'dateAge18',
    // 'DDI': 'dateAge19',
    // 'DDJ': 'dateAge21',
    // 'DDK': 'organDonor',
    // 'DDL': 'veteran',
  };
  defaultOptions = { suppressErrors: true };

  public async requestPort() {
    
    const port = await navigator.serial.requestPort();
  }

  public async connectBarCodeReader() {
    if (!navigator?.serial) return;

    let ports = null;
    const filters = [{ usbVendorId: 6790, usbProductId: 22307 }];
    try {
      ports = await navigator.serial.getPorts();
    } catch (error) {
      console.log('error on get ports', error);
      this.barcodeReaderNotConnected = true;

      return;

      this.session.showErrorMsg(error);
      return;
    }

    // console.log('port info',port.getInfo())
    const port = ports[0];
    const bufferSize = 4096; // 1kB
    let buffer = new ArrayBuffer(bufferSize);
    try {
      await port.open({ baudRate: 115200, bufferSize, flowControl: 'none' });
    } catch (error) {
      this.barcodeReaderNotConnected = true;
      return;

      this.session.showErrorMsg(error);

    }
    
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable
      .pipeThrough(new TransformStream(new LineBreakTransformer()))
      .getReader();
    while (port.readable) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
          }
          if (value) {
            this.myValue = value;
            console.log(value)
            this.parseDL(value);
          }
        }
      } catch (error) {
        // TODO: Handle non-fatal read error.

        console.log(error);
      }
    }

    return port;
  }
  private parseDL(str: string, options = this.defaultOptions) {

    if (str.includes('KALANI:' )){
      // const memberId = str.substring(str.indexOf(':')+2);
      // console.log('memberid',memberId)
      this.BarCodeDMemberId$.next(str.substring(str.indexOf(':')+2));

      return;
    }
    const lineSeparator = '\n';
    const props: any = {};
    const rawLines = str.trim().split(lineSeparator);
    const lines = rawLines.map((rawLine) => this.sanitizeData(rawLine));
    let started = false;

    lines.slice(0, -1).forEach((line) => {
      if (!started) {
        if (line.indexOf('ANSI ') === 0) {
          started = true;

          // has DLDAQ
          if (line.includes('DLDAQ')) {
            const lineArray = line.split('DLDAQ');
            line = 'DAQ' + lineArray[1];
          } else {
            return;
          }
        } else {
          return;
        }
      }

      let code = this.getCode(line);
      let value = this.getValue(line);
      let key = this.getKey(code);

      if (!key) {
        if (options.suppressErrors) {
        } else {
          throw new Error('unknown code: ' + code);
        }
      }
      if (this.isSexField(code)) value = this.getSex(code, value);

      if (key)
        props[key] = this.isDateField(key) ? this.getDateFormat(value) : value;
    });

    if ('DL' in props) {
      this.BarCodeDL$.next(props);
    }

    return props;
  }
  private sanitizeData = (rawLine: any) =>
    rawLine
      .match(/[\011\012\015\040-\177]*/g)
      .join('')
      .trim();

  private getCode = (line: any) => line.slice(0, 3);
  private getValue = (line: any) => line.slice(3);
  private getKey = (code: string) => this.CodeToKey[code];

  private isSexField = (code: any) => code === 'DBC';

  private getSex = (code: any, value: any) => (value === '1' ? 'M' : 'F');

  private isDateField = (key: any) => key.indexOf('DOB') === 0;

  private getDateFormat = (value: any) => {
    const [mm, dd, yyyy] = [
      value.slice(0, 2),
      value.slice(2, 4),
      value.slice(4),
    ];
    return `${yyyy}-${mm}-${dd}`;
  };
}
