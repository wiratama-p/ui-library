import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-book-list',
  imports: [
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    TruncatePipe,
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList implements OnInit {
  private readonly bookService = inject(BookService);

  protected readonly books = signal<Book[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly displayedColumns: string[] = [
    'title',
    'author',
    'isbn',
    'genre',
    'publicationYear',
    'description',
  ];

  ngOnInit(): void {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load books. Please try again later.');
        this.loading.set(false);
        console.error('Error fetching books:', err);
      },
    });
  }

  protected reload(): void {
    this.loadBooks();
  }
}
