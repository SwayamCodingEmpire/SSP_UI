import { Injectable } from '@angular/core';
import { Observable, timer, switchMap, takeWhile, share } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PollingService {
  /**
   * Polls a fetch function at the given interval until stopWhen returns true.
   * Emits every response including the final one (inclusive takeWhile).
   *
   * @param fetchFn   Observable factory called on each tick
   * @param stopWhen  Predicate — return true to stop polling
   * @param intervalMs Poll interval in ms (default 4 000)
   * @param delayMs   Initial delay before first poll (default 0)
   */
  poll<T>(
    fetchFn: () => Observable<T>,
    stopWhen: (result: T) => boolean,
    intervalMs = 4_000,
    delayMs = 0,
  ): Observable<T> {
    return timer(delayMs, intervalMs).pipe(
      switchMap(() => fetchFn()),
      takeWhile(result => !stopWhen(result), /* inclusive */ true),
      share(),
    );
  }
}
