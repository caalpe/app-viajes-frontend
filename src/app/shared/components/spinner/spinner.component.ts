import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerService } from './interceptors/spinner.service';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent implements OnInit {
  private spinnerService = inject(SpinnerService);

  @Input() message: string = 'Cargando...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() isGlobal: boolean = false; // Si es true, se muestra como overlay

  isVisible$ = this.spinnerService.isVisible$;
  message$ = this.spinnerService.message$;
  size$ = this.spinnerService.size$;

  ngOnInit(): void {
    // El servicio maneja la visibilidad del spinner global
  }
}

