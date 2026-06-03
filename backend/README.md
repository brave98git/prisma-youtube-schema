# YouTube Backend

Simple Express + Prisma backend using MVC pattern.

## Run Project

Install dependencies:

```bash
bun install
```

Start server:

```bash
bun run index.ts
```

Default server URL:

```text
http://localhost:3000
```

## Project Flow

```text
Client
  -> HTTP Request
  -> index.ts
  -> /api routes
  -> route file
  -> middleware
  -> controller
  -> Prisma
  -> database
  -> response helper
  -> JSON response
```

## MVC Structure

```text
index.ts
src/
  routes/
    index.ts
    auth.routes.ts
    user.routes.ts
    upload.routes.ts
  controllers/
    auth.controller.ts
    user.controller.ts
    upload.controller.ts
  middlewares/
    auth.middleware.ts
    validate.ts
  validators/
    auth.validator.ts
    user.validator.ts
    upload.validator.ts
  utils/
    apiResponse.ts
    jwt.ts
  types.ts
db.ts
prisma/
  schema.prisma
```

## Complete HTTP Request Flow

### 1. Client Sends Request

Example:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "demo",
  "password": "password123"
}
```

### 2. Server Starts In `index.ts`

`index.ts` creates the Express app and adds basic middleware:

```text
cors()
express.json()
/api routes
404 handler
error handler
```

All API requests start with:

```text
/api
```

### 3. Request Goes To Main Router

File:

```text
src/routes/index.ts
```

Route mapping:

```text
/api/auth     -> auth.routes.ts
/api/users    -> user.routes.ts
/api/uploads  -> upload.routes.ts
/api/health   -> health check
```

### 4. Request Goes To Route File

Example login route:

```text
POST /api/auth/login
```

Flow:

```text
auth.routes.ts
  -> validateBody(loginSchema)
  -> login controller
```

The route file only connects URL + middleware + controller.

### 5. Middleware Runs

Middleware is used before controller logic.

Validation middleware:

```text
validateBody(schema)
```

It checks request body using Zod.

If body is wrong:

```json
{
  "success": false,
  "message": "Validation error message"
}
```

Auth middleware:

```text
requireAuth
```

It checks JWT token from:

```text
Authorization: Bearer token_here
```

If token is missing or invalid:

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 6. Controller Handles Main Logic

Controller files:

```text
auth.controller.ts
user.controller.ts
upload.controller.ts
```

Controller responsibilities:

```text
read request data
call Prisma
check simple conditions
send response
```

Example login controller flow:

```text
get username and password
find user in database
compare password
create JWT token
send success response
```

### 7. Prisma Talks To Database

Database connection file:

```text
db.ts
```

Prisma schema:

```text
prisma/schema.prisma
```

Example:

```text
prisma.user.findFirst()
prisma.user.create()
prisma.uploads.findMany()
```

### 8. Response Helper Sends JSON

File:

```text
src/utils/apiResponse.ts
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "token": "jwt_token"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

## Common Status Codes

Keep status codes simple:

```text
200 -> success
201 -> created
400 -> bad request / validation error
401 -> not logged in / invalid token
403 -> not allowed
404 -> not found
409 -> already exists
500 -> server error
```

## Main API Endpoints

### Health

```http
GET /api/health
```

### Auth

```http
POST /api/auth/register
POST /api/auth/login
```

### Users

```http
GET /api/users
GET /api/users/:id
GET /api/users/me
PATCH /api/users/me
```

Protected routes need token:

```text
GET /api/users/me
PATCH /api/users/me
```

### Uploads

```http
GET /api/uploads
GET /api/uploads/:id
POST /api/uploads
PATCH /api/uploads/:id
DELETE /api/uploads/:id
```

Protected upload routes:

```text
POST /api/uploads
PATCH /api/uploads/:id
DELETE /api/uploads/:id
```

## Example Register Request

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "demo",
  "password": "password123",
  "gender": "MALE",
  "channelName": "Demo Channel",
  "banner": "https://example.com/banner.jpg",
  "profilePicture": "https://example.com/profile.jpg",
  "description": "My channel"
}
```

## Example Login Request

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "demo",
  "password": "password123"
}
```

## Example Protected Request

```http
GET /api/users/me
Authorization: Bearer jwt_token_here
```

## Example Create Upload Request

```http
POST /api/uploads
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

```json
{
  "videoUrl": "https://example.com/video.mp4",
  "thumbnail": "https://example.com/thumb.jpg"
}
```

## Simple Rule

Keep the code flow simple:

```text
route -> middleware -> controller -> database -> response
```

