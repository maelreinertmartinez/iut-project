# iut-project

# IUT Project

## Features

- User authentication with JWT
- Movie management (CRUD operations)
- User favorite movies
- Email notifications for new movies and updates
- CSV export of movies via message broker

## Prerequisites

- Node.js
- Docker

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=hapi
DB_DATABASE=user
DB_PORT=3306

# SMTP (for email notifications)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_email
SMTP_PASS=your_ethereal_password

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

## Setup

1. Clone the repository:

   ```
   git clone https://github.com/maelreinertmartinez/iut-project.git
   cd iut-project
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start MySQL:

   ```
   docker run -d --name hapi-mysql -e MYSQL_ROOT_PASSWORD=hapi -e MYSQL_DATABASE=user -p 3306:3306 mysql:8.0 --default-authentication-plugin=mysql_native_password
   ```

4. Start RabbitMQ:

   ```
   docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4.0-management
   ```

5. Run migrations:

   ```
   npx knex migrate:latest
   ```

6. Start the server:

   ```
   npm start
   ```

7. Start the CSV export worker:
   ```
   node lib/workers/csv-export-worker.js
   ```

## API Documentation

Once the server is running, you can access the Swagger documentation at `http://localhost:3000/documentation`.

### Authentication in Swagger

When using the "Authorize" button in the Swagger documentation, make sure to include the token in the format:
```
Bearer <your_token>
```
Note: Don't forget to include the word "Bearer" before your token, otherwise authentication will fail.

## Testing Email Notifications

This project uses Ethereal for testing email notifications. When a notification is sent, check the console log for a preview URL to view the email in Ethereal's web interface.
