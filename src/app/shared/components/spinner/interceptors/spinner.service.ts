import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private spinnerVisible$ = new BehaviorSubject<boolean>(false);
  private spinnerMessage$ = new BehaviorSubject<string>('Cargando...');
  private spinnerSize$ = new BehaviorSubject<'sm' | 'md' | 'lg'>('md');

  get isVisible$(): Observable<boolean> {
    return this.spinnerVisible$.asObservable();
  }

  get message$(): Observable<string> {
    return this.spinnerMessage$.asObservable();
  }

  get size$(): Observable<'sm' | 'md' | 'lg'> {
    return this.spinnerSize$.asObservable();
  }

  show(message: string = 'Cargando...', size: 'sm' | 'md' | 'lg' = 'md'): void {
    this.spinnerMessage$.next(message);
    this.spinnerSize$.next(size);
    this.spinnerVisible$.next(true);
  }

  hide(): void {
    this.spinnerVisible$.next(false);
  }
}
