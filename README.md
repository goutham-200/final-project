# Intelligent Teaching Strategy Recommendation Engine (ITSRE)

> "The right strategy for every student, every time."

## About the Project
ITSRE is a comprehensive MERN stack platform designed for teachers and school administrators. It allows educators to input student profiles (including learning styles, subject weaknesses, and performance scores) and leverages a weighted scoring algorithm to recommend the most effective teaching strategies from a curated database tailored specifically for each student's needs.

## Tech Stack Justification
- **MongoDB**: Provides flexible, schema-less storage for student profiles and strategy data that evolve frequently.
- **Express.js**: Serves as a minimal, fast REST API layer with a strong ecosystem of middlewares (like auth, logging, and validation).
- **React + Vite**: Delivers a component-based Single Page Application (SPA) with fast Hot Module Replacement (HMR) for developing a highly responsive teacher dashboard UI.
- **Node.js**: Unifies the stack with JavaScript, making it great for handling async interactions with the external AI APIs and cloud storage.
- **Redux Toolkit**: Maintains a predictable, centralized state for managing complex user sessions, dynamically changing student lists, and computed AI recommendations.

## Features
- **Role-based Dashboards:** Dedicated views for Teachers (managing students/recommendations) and Super Admins (managing the global strategy bank).
- **AI Recommendation Engine:** Rule-based algorithm factoring in the VARK learning style model, student performance, and subject weakness overlap for accurate strategy recommendations.
- **Dynamic Strategy Bank:** Explore, filter, and rate curated teaching strategies.
- **Cloud Media Uploads:** Direct integrations with Cloudinary for student avatars and strategy resources.

## System Architecture

**System Flow Diagram:**
Browser (React) → HTTP Request → Express Router → Auth Middleware (JWT verify) → Controller → Mongoose Model → MongoDB Atlas → JSON Response → Redux Store → React UI

External Integrations: Cloudinary (visual assets), OpenAI API (natural language explanations).

### ER Diagram Overview
- **User (Teacher)** `[1]` ──── teaches ──── `[many]` **Student**
- **Student** `[1]` ──── has ──── `[1]` **LearningProfile** (embedded in Student doc)
- **Student** `[many]` ──── receives ──── `[many]` **Strategy** via **Recommendation**
- **Admin** `[1]` ──── manages ──── `[many]` **Strategy**
- **Strategy** `[many]` ──── tagged ──── `[many]` **Subject**

## API Endpoints Reference
| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/register` | POST | Register new teacher/admin |
| `/api/auth/login` | POST | Validate credentials and return JWT |
| `/api/students` | GET/POST | Handle student lists for the logged-in teacher |
| `/api/strategies` | GET/POST | Fetch strategies with learningStyle/subject filtering |
| `/api/recommendations/generate`| POST | Run algorithm + get top 5 strategies for a student |

## Getting Started Setup
1. Clone the repository
2. Run `npm install` in both `/frontend` and `/backend` directories.
3. Configure the `.env` values (see below).
4. Run `npm run dev` in both directories to start the React development server and the Node API.

## Environment Variables
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secure string for signing JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary identifier
- `OPENAI_API_KEY` - Optional: OpenAI key for natural language explanations

## Security Measures
- **Passwords:** Hashed using `bcrypt` (12 salt rounds).
- **Sessions:** Protected using expirable JWTs (7-day validity).
- **Headers:** Secured via `Helmet.js`.
- **Throttling:** Brute-force protection on Auth routes via `express-rate-limit`.

## Testing
Comprehensive suites implemented for both the backend (Jest+Supertest) routing, business logic, and the React frontend components (Vitest + React Testing Library).

---
*Developed for Phase Requirements 1, 2, and 3.*
