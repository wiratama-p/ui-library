import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookList } from './book-list';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';

describe('BookList', () => {
  let httpMock: HttpTestingController;
  let bookService: BookService;

  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      publicationYear: '1925',
      isbn: '9780743273565',
      genre: 'Fiction',
      description: 'A classic American novel set in the Jazz Age.',
    },
    {
      id: 2,
      title: '1984',
      author: 'George Orwell',
      publicationYear: '1949',
      isbn: '9780451524935',
      genre: 'Dystopian',
      description: 'A dystopian social science fiction novel.',
    },
    {
      id: 3,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      publicationYear: '1960',
      isbn: '9780061120084',
      genre: 'Fiction',
      description: 'A novel about racial injustice in the American South.',
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [BookList],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        BookService,
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: MatDialog,
          useValue: { open: vi.fn() },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    bookService = TestBed.inject(BookService);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(BookList);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should load books on initialization', async () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    expect(req.request.method).toBe('GET');
    req.flush(mockBooks);

    fixture.detectChanges();
    await fixture.whenStable();

    // Check through the DOM since properties are protected
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(mockBooks.length);
  });

  it('should display books in a table', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tr.mat-mdc-row');

    expect(rows.length).toBe(mockBooks.length);
  });

  it('should display book title in the table', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('The Great Gatsby');
  });

  it('should display book author in the table', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('F. Scott Fitzgerald');
    expect(compiled.textContent).toContain('George Orwell');
    expect(compiled.textContent).toContain('Harper Lee');
  });

  it('should display book ISBN in the table', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('9780743273565');
  });

  it('should display book genre as a chip', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const chips = compiled.querySelectorAll('mat-chip');

    expect(chips.length).toBeGreaterThan(0);
    expect(compiled.textContent).toContain('Fiction');
    expect(compiled.textContent).toContain('Dystopian');
  });

  it('should display publication year', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1925');
    expect(compiled.textContent).toContain('1949');
    expect(compiled.textContent).toContain('1960');
  });

  it('should truncate long descriptions', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const descriptions = compiled.querySelectorAll('td.mat-mdc-cell');

    // Check that descriptions are truncated (contain "...")
    const hasEllipsis = Array.from(descriptions).some((td) =>
      td.textContent?.includes('...')
    );
    expect(hasEllipsis).toBe(true);
  });

  it('should display edit and delete buttons for each book', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const editButtons = compiled.querySelectorAll('button mat-icon');
    const editIcons = Array.from(editButtons).filter((icon) => icon.textContent?.trim() === 'edit');
    const deleteIcons = Array.from(editButtons).filter((icon) => icon.textContent?.trim() === 'delete');

    expect(editIcons.length).toBe(mockBooks.length);
    expect(deleteIcons.length).toBe(mockBooks.length);
  });

  it('should display error message on API failure', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Failed to load books');
  });

  it('should display empty state when no books are returned', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No books found');
  });

  it('should display "Add Book" button', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('button');

    expect(addButton?.textContent).toContain('Add Book');
  });

  it('should display search input field', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const searchInput = compiled.querySelector('input[placeholder*="Search"]');

    expect(searchInput).toBeTruthy();
  });

  it('should have table header with correct columns', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const headers = compiled.querySelectorAll('th.mat-mdc-header-cell');
    const headerTexts = Array.from(headers).map((h) => h.textContent?.trim());

    expect(headerTexts).toContain('Title');
    expect(headerTexts).toContain('Author');
    expect(headerTexts).toContain('ISBN');
    expect(headerTexts).toContain('Genre');
    expect(headerTexts).toContain('Year');
    expect(headerTexts).toContain('Description');
    expect(headerTexts).toContain('Actions');
  });

  it('should display all three books from mock data', () => {
    const fixture = TestBed.createComponent(BookList);
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/books');
    req.flush(mockBooks);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('The Great Gatsby');
    expect(compiled.textContent).toContain('1984');
    expect(compiled.textContent).toContain('To Kill a Mockingbird');
  });
});
