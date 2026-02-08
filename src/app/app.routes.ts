import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'books',
    pathMatch: 'full',
  },
  {
    path: 'books',
    loadComponent: () => import('./pages/book-list/book-list').then((m) => m.BookList),
  },
  {
    path: 'books/new',
    loadComponent: () => import('./pages/book-form/book-form').then((m) => m.BookForm),
  },
  {
    path: 'books/edit/:id',
    loadComponent: () => import('./pages/book-form/book-form').then((m) => m.BookForm),
  },
];
