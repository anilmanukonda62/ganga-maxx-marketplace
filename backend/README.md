# Ganga Maxx Marketplace Backend

This is the production-ready, modular, and error-free backend API for the Ganga Maxx Marketplace project, built using Node.js, Express, and MongoDB. It is designed to run independently and can be easily connected to the React frontend later with zero breaking changes.

## Tech Stack
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (for ODM and data validation)
- **bcryptjs** (for secure admin password hashing)
- **jsonwebtoken (JWT)** (for stateless admin session management)
- **cors** (configured to handle request cross-origin authorization)
- **express-validator** (for robust route-level request input validation)
- **morgan** (for request logging during development)
- **nodemon** (for hot-reloading development server)

## Installation & Setup

1. **Navigate into the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `/backend` folder. Copy and use the following exact values (or match them with your target setup):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://gangamaxx_admin:GangaMaxx%409059@gangamaxx.7uxrlid.mongodb.net/gangamaxx?retryWrites=true&w=majority&appName=gangamaxx
   JWT_SECRET=gangamaxx_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ADMIN_DEFAULT_USERNAME=admin
   ADMIN_DEFAULT_PASSWORD=Admin@2026
   ```

4. **Seed the Database**:
   Seed the 5 core categories, 22 products, and the default admin account into MongoDB:
   ```bash
   node seed/seedProducts.js
   ```

5. **Run the Application**:
   - **Development Mode** (with Nodemon hot-reload):
     ```bash
     npm run dev
     ```
   - **Production Mode**:
     ```bash
     npm start
     ```

---

## Admin Default Credentials
- **Username**: `admin`
- **Password**: `Admin@2026`

---

## API Endpoints List

### Health
- `GET /api/health` - Check if the API server is running successfully (Public).

### Products API
- `GET /api/products` - Retrieve all products (Public). Supports filtering/sorting query params:
  - `?category=cleaning-chemicals`
  - `?search=laundry`
  - `?inStock=true` (removes out-of-stock items)
  - `?minPrice=100` & `?maxPrice=500`
  - `?sort=price_asc` or `?sort=price_desc`
- `GET /api/products/categories` - Returns list of the 5 categories (Public).
- `GET /api/products/:id` - Fetch details of a single product using its custom numeric `id` (Public).
- `GET /api/products/:id/related` - Fetch related products within the same category, excluding the current one (Public). Supports `?limit=N` (default: 4).
- `POST /api/products` - Create a new product (Admin Only).
- `PUT /api/products/:id` - Update an existing product by numeric `id` (Admin Only).
- `DELETE /api/products/:id` - Delete a product by numeric `id` (Admin Only).

### Enquiries API
- `POST /api/enquiries` - Submit a new customer B2B enquiry (Public). Required fields: `fullName`, `phone`, `companyName`.
- `GET /api/enquiries` - Retrieve list of all B2B enquiries (Admin Only). Supports filters: `?status=` and `?search=`.
- `GET /api/enquiries/:id` - Fetch single enquiry details by Mongoose `_id` (Admin Only).
- `PUT /api/enquiries/:id/status` - Update an enquiry's status to `New`, `Contacted`, or `Closed` (Admin Only).
- `DELETE /api/enquiries/:id` - Remove an enquiry from the database (Admin Only).

### Contact Messages API
- `POST /api/contact` - Submit a customer contact message (Public). Required fields: `name`, `email`, `subject`, `message`.
- `GET /api/contact` - Retrieve all submitted contact messages (Admin Only). Supports filter: `?status=`.
- `PUT /api/contact/:id/status` - Update message status to `New`, `Read`, or `Replied` (Admin Only).
- `DELETE /api/contact/:id` - Delete a contact message (Admin Only).

### Admin Authentication & Dashboard
- `POST /api/admin/login` - Authenticate admin credentials and receive a JWT token (Public).
- `GET /api/admin/me` - Get profile details of the currently authenticated admin (Admin Only).
- `GET /api/admin/dashboard` - Get metric statistics for the admin dashboard (Admin Only).
