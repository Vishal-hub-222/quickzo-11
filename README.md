# 🛍️ Quickzo-11

Quickzo-11 is a full-stack e-commerce project with three apps in a single repository:

- ⚙️ **backend**: Express + MongoDB API for products, users, authentication, and cart operations.
- 🛒 **frontend1**: Customer-facing React storefront (Vite).
- 🧑‍💼 **admin1**: React admin panel (Vite) for product management.

## 🧭 Project structure

```text
quickzo-11/
├── backend/
├── frontend1/
└── admin1/
```

## ✅ Prerequisites

- Node.js 18+
- npm
- MongoDB connection string
- Cloudinary account (for product image uploads)

## ⚙️ Backend setup (`/backend`)

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend/` with:

   ```env
   PORT=4000
   MONGO_URL=your_mongodb_connection_string
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

3. Start the server:

   ```bash
   npm start
   ```

The API will run on the port defined in `PORT`.

## 🛒 Frontend setup (`/frontend1`)

1. Install dependencies:

   ```bash
   cd frontend1
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Build production bundle:

   ```bash
   npm run build
   ```

## 🧑‍💼 Admin setup (`/admin1`)

1. Install dependencies:

   ```bash
   cd admin1
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Build production bundle:

   ```bash
   npm run build
   ```

## 🔌 Backend API summary

### 🌐 Public endpoints

- `GET /` – Health/home route.
- `POST /signup` – Register a new user.
- `POST /login` – Login and receive JWT.
- `GET /allproducts` – Fetch all products.
- `GET /newcollection` – Fetch newest collection items.
- `GET /popularinwoman` – Fetch popular women category items.
- `POST /upload` – Upload product image to Cloudinary.
- `POST /addproduct` – Add a new product.
- `DELETE /deleteproduct/:id` – Delete a product by Mongo `_id`.

### 🔐 Authenticated endpoints (require `auth-token` header)

- `POST /addtocart` – Add product to cart.
- `POST /removefromcart` – Remove product from cart.
- `POST /getcart` – Get current user cart data.

## 📝 Notes

- ⚠️ JWT secret is currently hardcoded in backend source (`secret_ecom`) and should be moved to environment variables for production use.
- 📚 Existing `frontend1/README.md` and `admin1/README.md` are the default Vite template docs; this root README is intended to document the full monorepo.
