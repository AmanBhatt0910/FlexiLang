# FlexiLang - Multi-Language Cross Compiler

FlexiLang is a powerful API-based code translation service that allows developers to convert code between different programming languages. Currently, it supports JavaScript to Python translation with plans to expand to other languages.

## Features

* **Authentication System**: Secure user registration and login with JWT
* **Code Translation**: Convert JavaScript code to Python with high accuracy
* **Translation History**: Track your translation history (for registered users)
* **RESTful API**: Well-structured API for easy integration
* **Modern Web Interface**: Intuitive Next.js frontend for easy code translation

## Project Structure

```
/flexilang
├── /frontend             # Next.js frontend application
│   ├── /components       # Reusable UI components
│   ├── /pages            # Next.js pages and API routes
│   ├── /public           # Static assets
│   ├── /styles           # CSS and styling
│   ├── /utils            # Frontend utility functions
│   ├── next.config.js    # Next.js configuration
│   └── package.json      # Frontend dependencies
│
├── /backend              # Express backend API
│   ├── /config
│   │   └── db.js         # Database connection
│   ├── /controllers
│   │   ├── authController.js    # User authentication logic
│   │   └── translateController.js # Code translation logic
│   ├── /middlewares
│   │   └── authMiddleware.js    # JWT authentication middleware
│   ├── /models
│   │   └── User.js       # User model schema
│   ├── /routes
│   │   ├── authRoutes.js      # Authentication routes
│   │   └── translateRoutes.js # Translation routes
│   ├── /utils
│   │   └── languageUtils.js   # Language translation utilities
│   ├── server.js         # Express server setup
│   ├── package.json      # Backend dependencies
│   └── .env              # Environment variables
```

## Getting Started

### Prerequisites

* Node.js (v14 or higher)
* MongoDB

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/flexilang.git
cd flexilang
```

2. Install backend dependencies:

```
cd backend
npm install
```

3. Create a backend `.env` file based on `.env.example`:

```
cp .env.example .env
```

4. Update the backend `.env` file with your MongoDB connection string and JWT secret

5. Install frontend dependencies:

```
cd ../frontend
npm install
```

6. Create a frontend `.env.local` file:

```
cp .env.example .env.local
```

7. Update the frontend `.env.local` file with your API base URL

8. Start the development servers:

Backend:
```
cd backend
npm run dev
```

Frontend:
```
cd frontend
npm run dev
```

## API Endpoints

### Authentication

* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Login and get JWT token
* `GET /api/auth/profile` - Get user profile (requires authentication)

### Code Translation

* `POST /api/translate` - Translate code (requires authentication)
   * Request body:

```json
{
  "sourceCode": "// Your code here",
  "fromLanguage": "javascript",
  "toLanguage": "python"
}
```

* `GET /api/translate/history` - Retrieve translation history (requires authentication)

## Code Translation Capabilities

The JavaScript to Python translator can handle:
* Variable declarations and assignments
* If/else statements
* Loops (for, while, for...of, for...in)
* Functions and arrow functions
* Basic array operations and methods
* Object literals
* Error handling (try/catch)
* String operations and template literals

## Error Handling

API responses include appropriate HTTP status codes:
* `200 OK` - Request successful
* `201 Created` - Resource created successfully
* `400 Bad Request` - Invalid inputs or parameters
* `401 Unauthorized` - Authentication required or failed
* `404 Not Found` - Resource not found
* `500 Server Error` - Internal server error

## Security Considerations

* All passwords are hashed using bcrypt
* JWT tokens expire after 24 hours
* CORS is properly configured
* Rate limiting is implemented to prevent abuse

## Frontend Features

* **Code Editor**: Syntax-highlighted editor for both input and output code
* **Language Selection**: Easy selection of source and target languages
* **User Dashboard**: View and manage past translations
* **Responsive Design**: Works on desktop and mobile devices
* **Dark/Light Mode**: Choose your preferred theme

## Future Roadmap

* Support for additional languages (Java, C#, Ruby, PHP)
* Advanced code optimization features
* Syntax highlighting in the API response
* Interactive documentation with Swagger UI
* Real-time collaborative translation workspace
* Code snippet sharing functionality
* Browser extension for quick translations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

* Thanks to all the open-source libraries that made this project possible
* Special thanks to the community for feedback and suggestions