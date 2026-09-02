import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('cospa_token') || localStorage.getItem('token');
  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/registrar');

  const isValidToken = !!token && token !== 'undefined' && token !== 'null' && token.trim().length > 0;

  let authReq = req;
  if (isValidToken && !isAuthRoute) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token.trim()}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('cospa_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};