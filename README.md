# 🚀 Microservices Architecture with GraphQL, Kafka, Redis, and Docker

## 📌 Project Overview
This project consists of **four microservices**:
1. **GraphQL Gateway** - Unified API for all microservices.
2. **User Service** - Manages authentication, user registration, and login.
3. **Order Service** - Handles order creation, processing, and Kafka events.
4. **Product Service** - Manages products and stock updates.

### ✅ Technologies Used
- **Node.js** - Backend framework for each microservice.
- **GraphQL** - API gateway to communicate with all services.
- **Kafka** - Message broker for event-driven communication.
- **Redis** - Caching layer for performance optimization.
- **MongoDB** - NoSQL database for storing users, orders, and products.
- **Docker & Docker Compose** - Containerized environment.

---

## 📌 Microservices Overview
| **Service**        | **Port** | **Functionality** |
|--------------------|---------|------------------|
| **GraphQL Gateway** | `7000`  | Unifies all APIs for communication. |
| **User Service**   | `8000`  | Manages authentication and user data. |
| **Order Service**  | `8001`  | Handles order processing and stock validation via Kafka. |
| **Product Service** | `8002`  | Manages product inventory, integrates with Kafka for stock updates. |
| **Kafka**         | `9092`  | Message broker for inter-service communication. |
| **Redis**         | `6379`  | Caching layer for faster performance. |
| **MongoDB**       | `27017` | Database for all microservices. |

---

## 📌 Setup & Installation

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/microservices-app.git
cd microservices-app
```
### Build the project and run
```sh
docker compose up --build

