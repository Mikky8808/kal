import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  log(message: string, data?: any) {
    console.log(`[LOG] ${message}`, data || '');
  }
}