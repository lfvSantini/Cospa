import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('cospa_token') || localStorage.getItem('token');
  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/registrar');

  const isValidToken = !!token && token !== 'undefined' && token !== 'null' && token.trim().length > 0;

  if (isValidToken && !isAuthRoute) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token.trim()}`
      }
    });
    return next(cloned);
  }

  return next(req);
};