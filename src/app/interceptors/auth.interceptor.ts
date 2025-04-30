import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authToken = localStorage.getItem('basicAuth');

  if (authToken) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Basic ${authToken}`)
    });
    return next(authReq);
  }

  return next(req);
};
