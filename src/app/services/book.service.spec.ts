import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookService } from './book.service';
import { Book } from '../models/book.model';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      publicationYear: '1925',
      isbn: '9780743273565',
      genre: 'Fiction',
      description: 'A classic American novel.',
    },
    {
      id: 2,
      title: '1984',
      author: 'George Orwell',
      publicationYear: '1949',
      isbn: '9780451524935',
      genre: 'Dystopian',
      description: 'A dystopian novel.',
    },
  ];

  const mockBook: Book = mockBooks[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBooks', () => {
    it('should fetch all books', () => {
      service.getBooks().subscribe((books) => {
        expect(books).toEqual(mockBooks);
        expect(books.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:8080/books');
      expect(req.request.method).toBe('GET');
      req.flush(mockBooks);
    });

    it('should fetch books with search parameter', () => {
      const searchTerm = 'Gatsby';

      service.getBooks(searchTerm).subscribe((books) => {
        expect(books).toEqual([mockBooks[0]]);
      });

      const req = httpMock.expectOne('http://localhost:8080/books?search=Gatsby');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('search')).toBe('Gatsby');
      req.flush([mockBooks[0]]);
    });

    it('should trim search parameter', () => {
      service.getBooks('  1984  ').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/books?search=1984');
      expect(req.request.params.get('search')).toBe('1984');
      req.flush([mockBooks[1]]);
    });

    it('should not add search param if search is empty', () => {
      service.getBooks('').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/books');
      expect(req.request.params.has('search')).toBe(false);
      req.flush(mockBooks);
    });
  });

  describe('getBook', () => {
    it('should fetch a single book by id', () => {
      const bookId = 1;

      service.getBook(bookId).subscribe((book) => {
        expect(book).toEqual(mockBook);
      });

      const req = httpMock.expectOne('http://localhost:8080/books/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockBook);
    });
  });

  describe('createBook', () => {
    it('should create a new book', () => {
      const newBook: Omit<Book, 'id'> = {
        title: 'New Book',
        author: 'New Author',
        publicationYear: '2024',
        isbn: '9781234567890',
        genre: 'Technology',
        description: 'A new book',
      };

      const createdBook: Book = { id: 3, ...newBook };

      service.createBook(newBook).subscribe((book) => {
        expect(book).toEqual(createdBook);
      });

      const req = httpMock.expectOne('http://localhost:8080/books');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newBook);
      req.flush(createdBook);
    });
  });

  describe('updateBook', () => {
    it('should update an existing book', () => {
      const bookId = 1;
      const updatedData: Omit<Book, 'id'> = {
        ...mockBook,
        title: 'Updated Title',
      };

      const updatedBook: Book = { id: bookId, ...updatedData };

      service.updateBook(bookId, updatedData).subscribe((book) => {
        expect(book).toEqual(updatedBook);
      });

      const req = httpMock.expectOne('http://localhost:8080/books/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(updatedBook);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', () => {
      const bookId = 1;

      service.deleteBook(bookId).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne('http://localhost:8080/books/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('error handling', () => {
    it('should handle 404 error when fetching books', () => {
      service.getBooks().subscribe({
        next: () => {
          throw new Error('should have failed with 404 error');
        },
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne('http://localhost:8080/books');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 error when creating book', () => {
      const newBook: Omit<Book, 'id'> = {
        title: 'New Book',
        author: 'Author',
        publicationYear: '2024',
        isbn: '9781234567890',
        genre: 'Fiction',
        description: 'Description',
      };

      service.createBook(newBook).subscribe({
        next: () => {
          throw new Error('should have failed with 500 error');
        },
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne('http://localhost:8080/books');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
