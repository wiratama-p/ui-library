# Library Management - UI Application

A modern Angular 21 application for managing a library's book collection with Material Design components.

## Running the App Locally

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Angular CLI** (optional but recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/wiratama-p/ui-library.git
cd ui-library
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if you're using yarn:

```bash
yarn install
```

### Step 3: Configure Backend API URL (Optional)

If your backend API is not running on `http://localhost:8080`, update the API URL:

**src/app/services/book.service.ts**
```typescript
private readonly apiUrl = 'http://your-backend-url/books';
```

Or create environment files (recommended):

**src/environments/environment.ts**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### Step 4: Start the Development Server

```bash
npm start
```

Or using Angular CLI directly:

```bash
ng serve
```

The application will be available at:
```
http://localhost:4200
```

The app will automatically reload whenever you modify source files.

### Step 5: Verify Backend Connection

Make sure your backend API is running on `http://localhost:8080` (or the configured URL).

The UI expects the following endpoints:
- `GET /books` - List all books (with optional `?search=` parameter)
- `GET /books/:id` - Get single book
- `POST /books` - Create new book
- `PUT /books/:id` - Update existing book
- `DELETE /books/:id` - Delete book

## Development Commands

### Start Development Server
```bash
npm start                 # Start on http://localhost:4200
ng serve --port 3000      # Start on custom port
ng serve --open           # Start and open browser automatically
```

### Build for Production
```bash
npm run build             # Build for production
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

### Run Tests
```bash
npm test                  # Run unit tests with Vitest
ng test                   # Alternative command
```
  

For a complete list of available schematics:
```bash
ng generate --help
```

### Backend Connection Issues
1. Verify backend is running on `http://localhost:8080`
2. Check CORS is enabled on backend for `http://localhost:4200`
3. Check browser console for network errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
rm -rf .angular
```
