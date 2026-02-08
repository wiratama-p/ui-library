import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css',
})
export class BookForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bookService = inject(BookService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly bookForm: FormGroup;
  protected readonly loading = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly bookId = signal<number | null>(null);

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      author: ['', [Validators.required, Validators.maxLength(255)]],
      publicationYear: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      isbn: ['', [Validators.required, this.isbnValidator]],
      genre: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.bookId.set(Number(id));
      this.loadBook(Number(id));
    }
  }

  private loadBook(id: number): void {
    this.loading.set(true);
    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.bookForm.patchValue({
          title: book.title,
          author: book.author,
          publicationYear: book.publicationYear,
          isbn: book.isbn,
          genre: book.genre,
          description: book.description,
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading book:', err);
        this.snackBar.open('Failed to load book', 'Close', { duration: 3000 });
        this.loading.set(false);
        this.router.navigate(['/books']);
      },
    });
  }

  private isbnValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const cleanValue = value.replace(/\s/g, '');
    if (value.includes('-')) {
      return { isbn: 'ISBN must not contain dashes' };
    }
    if (!/^\d{13}$/.test(cleanValue)) {
      return { isbn: 'ISBN must be exactly 13 digits' };
    }
    if (!cleanValue.startsWith('978') && !cleanValue.startsWith('979')) {
      return { isbn: 'ISBN must start with 978 or 979' };
    }
    return null;
  }

  protected onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.bookForm.value;

    if (this.isEditMode() && this.bookId()) {
      this.bookService.updateBook(this.bookId()!, formValue).subscribe({
        next: () => {
          this.snackBar.open('Book updated successfully', 'Close', { duration: 3000 });
          this.loading.set(false);
          this.router.navigate(['/books']);
        },
        error: (err) => {
          console.error('Error updating book:', err);
          this.snackBar.open('Failed to update book', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
    } else {
      this.bookService.createBook(formValue).subscribe({
        next: () => {
          this.snackBar.open('Book created successfully', 'Close', { duration: 3000 });
          this.loading.set(false);
          this.bookForm.reset();
          Object.keys(this.bookForm.controls).forEach((key) => {
            this.bookForm.get(key)?.setErrors(null);
          });
        },
        error: (err) => {
          console.error('Error creating book:', err);
          this.snackBar.open('Failed to create book', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
    }
  }

  protected onCancel(): void {
    this.router.navigate(['/books']);
  }

  protected getErrorMessage(fieldName: string): string {
    const control = this.bookForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control.errors['maxLength']) {
      return `${this.getFieldLabel(fieldName)} is too long`;
    }
    if (control.errors['pattern']) {
      return `${this.getFieldLabel(fieldName)} must be a valid 4-digit year`;
    }
    if (control.errors['isbn']) {
      return control.errors['isbn'];
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      author: 'Author',
      publicationYear: 'Publication Year',
      isbn: 'ISBN',
      genre: 'Genre',
      description: 'Description',
    };
    return labels[fieldName] || fieldName;
  }
}
