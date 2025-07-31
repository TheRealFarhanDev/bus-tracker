# 🔐 BusTracker Authentication System

## Overview

BusTracker now includes a complete authentication system with MongoDB, JWT tokens, and role-based access control.

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **MongoDB**: User data storage with Mongoose ODM
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **Role-based Access**: Student and Admin roles

### Frontend (React)
- **Protected Routes**: Role-based route protection
- **Token Management**: Automatic token handling
- **Login/Register**: Beautiful UI with shadcn/ui components

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. MongoDB Setup

Make sure MongoDB is running locally or update the connection string in `.env`:

```env
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
```

**Note**: The system supports multiple environment variable names for MongoDB URI:
- `MONGO_URI` (recommended)
- `MONGODB_URI`
- `DATABASE_URL`
- `DB_URI`

### 3. Create Default Users

```bash
npm run create-users
```

This creates the following test accounts:
- **Student**: `student1` / `password123`
- **Admin**: `admin1` / `admin123`
- **Student**: `john` / `password123`
- **Admin**: `admin` / `admin123`

### 4. Start Backend

```bash
npm run dev
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Authentication Flow

### Registration
1. User visits `/login`
2. Clicks "Sign up" to switch to registration mode
3. Fills in name, password, and selects role
4. Account is created and user is logged in
5. Redirected to appropriate dashboard based on role

### Login
1. User visits `/login`
2. Enters name and password
3. JWT token is generated and stored
4. User is redirected to appropriate dashboard

### Protected Routes
- `/student`: Accessible by students and admins
- `/admin`: Accessible only by admins
- Unauthorized access redirects to login

## 🛡️ Security Features

### Password Security
- **Hashing**: bcryptjs with salt rounds
- **Validation**: Minimum 6 characters
- **Storage**: Hashed passwords only

### Token Security
- **JWT**: 7-day expiration
- **Automatic Refresh**: Token included in all API requests
- **Logout**: Token removal on logout

### Role-based Access
- **Student Role**: Can access student dashboard
- **Admin Role**: Can access both student and admin dashboards
- **Route Protection**: Automatic redirects for unauthorized access

## 📱 User Interface

### Login Page Features
- **Toggle**: Switch between login and register
- **Role Selection**: Choose student or admin (registration only)
- **Password Visibility**: Toggle password field visibility
- **Error Handling**: Clear error messages
- **Loading States**: Spinner during authentication
- **Responsive Design**: Works on all devices

### Navigation
- **Dynamic Header**: Shows user name when logged in
- **Logout Button**: Easy access to logout
- **Role-based Links**: Admin sees both dashboards

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Protected Routes
- All routes require valid JWT token
- Automatic token inclusion in requests
- 401 errors redirect to login

## 🧪 Testing

### Default Test Accounts

#### Student Accounts
```
Name: student1
Password: password123
Role: student
```

```
Name: john
Password: password123
Role: student
```

#### Admin Accounts
```
Name: admin1
Password: admin123
Role: admin
```

```
Name: admin
Password: admin123
Role: admin
```

### Testing Scenarios
1. **Student Login**: Should access student dashboard only
2. **Admin Login**: Should access both dashboards
3. **Invalid Credentials**: Should show error message
4. **Token Expiry**: Should redirect to login
5. **Unauthorized Access**: Should redirect based on role

## 🚨 Error Handling

### Common Errors
- **Invalid Credentials**: Clear error message
- **User Already Exists**: Registration error
- **Token Expired**: Automatic redirect to login
- **Network Errors**: User-friendly error messages

### Error Recovery
- **Automatic Logout**: On 401 responses
- **Token Refresh**: Automatic token inclusion
- **Route Protection**: Prevents unauthorized access

## 🔄 State Management

### Local Storage
- **Token**: JWT authentication token
- **User**: User object with role and name
- **Automatic Cleanup**: On logout or token expiry

### React State
- **Authentication Status**: Real-time login state
- **User Role**: Dynamic UI based on role
- **Loading States**: Smooth user experience

## 🎨 UI Components

### shadcn/ui Integration
- **Card Component**: Beautiful login form
- **Input Fields**: Styled form inputs
- **Buttons**: Consistent button styling
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first design

### Design Features
- **Gradient Backgrounds**: Modern visual appeal
- **Smooth Transitions**: Professional animations
- **Error States**: Clear visual feedback
- **Loading Indicators**: User-friendly spinners

## 🔮 Future Enhancements

### Planned Features
- **Password Reset**: Email-based password recovery
- **Remember Me**: Extended session duration
- **Two-Factor Auth**: Enhanced security
- **User Profiles**: Editable user information
- **Session Management**: Multiple device support

### Scalability
- **Database Indexing**: Optimized queries
- **Token Refresh**: Automatic token renewal
- **Rate Limiting**: API protection
- **Audit Logging**: Security monitoring

---

**Built with ❤️ for secure bus tracking** 