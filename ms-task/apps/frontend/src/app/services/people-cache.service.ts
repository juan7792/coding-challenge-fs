import { PeopleDto } from './../../../../../shared/src/lib/peopleDto';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeopleCacheService {
  private cache: { [key: string]: PeopleDto[] } = {};

  constructor(private http: HttpClient) {
    const savedCache = localStorage.getItem('apiCache');
    if (savedCache) {
      this.cache = JSON.parse(savedCache);
    }
   }

   get(url: string): Observable<PeopleDto[]> {
    if (this.cache[url]) {
      return of(this.cache[url]);
    } else {
      return this.http.get<PeopleDto[]>(url).pipe(
        tap(response => {
          this.cache[url] = response;
          localStorage.setItem('apiCache', JSON.stringify(this.cache));
        }),
      );
    }
   }
}