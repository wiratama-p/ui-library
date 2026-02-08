import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';

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
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TruncatePipe,
  ],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList implements OnInit, OnDestroy {
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  protected readonly books = signal<Book[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchControl = new FormControl('');

  protected readonly displayedColumns: string[] = [
    'title',
    'author',
    'isbn',
    'genre',
    'publicationYear',
    'description',
    'actions',
  ];

  ngOnInit(): void {
    this.loadBooks();
    this.setupSearchListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchListener(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.loadBooks(searchTerm || '');
      });
  }

  private loadBooks(search: string = ''): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookService.getBooks(search).subscribe({
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
    this.loadBooks(this.searchControl.value || '');
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  protected createBook(): void {
    this.router.navigate(['/books/new']);
  }

  protected editBook(book: Book): void {
    this.router.navigate(['/books/edit', book.id]);
  }

  protected deleteBook(book: Book): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Book',
        message: `Are you sure you want to delete "${book.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.bookService.deleteBook(book.id).subscribe({
          next: () => {
            this.snackBar.open('Book deleted successfully', 'Close', { duration: 3000 });
            this.loadBooks(this.searchControl.value || '');
          },
          error: (err) => {
            console.error('Error deleting book:', err);
            this.snackBar.open('Failed to delete book', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}
