import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  isUserAuthenticated: boolean = false;
  searchForm!: FormGroup;
  private subs: Subscription = new Subscription();

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Inicializar formulario reactivo
    this.searchForm = this.fb.group(
      {
        destination: [''],
        from: [''],
        to: [''],
        budget: [null, [Validators.min(0)]],
      },
      { validators: this.dateRangeValidator }
    );

    // Suscribirse al estado de autenticación
    const authSub = this.authService.authStatus$.subscribe((status) => {
      this.isUserAuthenticated = status;
    });
    this.subs.add(authSub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleAuth(value: boolean) {
    this.authService.setAuthStatus(value);
  }

  // Getters usados en la plantilla
  get fromControl(): AbstractControl | null {
    return this.searchForm.get('from');
  }

  get toControl(): AbstractControl | null {
    return this.searchForm.get('to');
  }

  get budgetControl(): AbstractControl | null {
    return this.searchForm.get('budget');
  }

  // Validador personalizado: desde <= hasta
  private dateRangeValidator: ValidatorFn = (group: AbstractControl) => {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    if (!from || !to) return null;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return fromDate <= toDate ? null : { dateRange: true };
  };
}
