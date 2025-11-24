import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStatus = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatus.asObservable();


  setAuthStatus(status: boolean): void {
    this.authStatus.next(status);
  }

  getAuthStatus(): boolean {
    return this.authStatus.value;
  }
}
