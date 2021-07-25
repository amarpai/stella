# Stella coding test
Nodejs - Rest API Application using Relational Postgres DB  (Amar Pai Fondekar)


**Features Completed:**
* Search with city, date, apartmentType, amenities.
* Search with flexible type Weekend


## API backend endpoints (port 8080)

* Steps to Start the Application
1) go to root folder containing package.json
2) npm Install
3) Run the Postgre Public Schema : Location app\config\db.schema.sql
4) Modify DB properties : Location app\config\db.config.js
5) node server.js or nodemon server.js (if you have global installation of nodemon)


**API URL**

```bash

POST http://localhost:8080/api/v1/listings

```

Postman Export: https://www.getpostman.com/collections/d732989770424c15be1f

![image](https://user-images.githubusercontent.com/10544557/126906143-4ff16a2a-78e1-4fb9-a6c3-70f1a3193ba9.png)


**Test Case 1:**

![image](https://user-images.githubusercontent.com/10544557/126906202-b00a96dc-ce72-421b-be6c-c998b19d0461.png)

**Test Case 2:** 

![image](https://user-images.githubusercontent.com/10544557/126906239-b76b88d9-c9bc-498b-a6b2-a1fb4ff8ae0d.png)

**Test Case 3:**

![image](https://user-images.githubusercontent.com/10544557/126906257-067abf55-bb68-4c7e-af3c-d9cb9d1d9032.png)


