import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';

/** Normalises v2 API error responses `{ error, message }` into a plain Error. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const body = err.error;
      if (body && typeof body === 'object' && 'message' in body) {
        return throwError(() => new Error(body['message'] ?? 'An error occurred.'));
      }
      return throwError(() => err);
    }),
  );
};
