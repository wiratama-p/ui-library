import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/books';

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }
}
