# ShopCart

ShopCart is an app used for buying a wide range of products. All selected products can be paid for online using the card payment method. The customers will receive after payment a invoice with all products purchased. Customers can be individuals or companies.

## Technologies

Below is a list of all the technologies used to develop the app. They are structured by categories.

**Frontend** 
   - HTML
   - CSS
   - JavaScript

**Backend**
   - NodeJS

**Databases**
   - MongoDB

**Cloud**
   - [Stripe](https://stripe.com/docs/api)

## Run & Build commands

As the application is developed using the NodeJS to launch it in development mode or for deployment we should run some commands that allow us to perform these processes.

Before executing any command, we must make sure that the dependencies (**node_modules**) are installed, otherwise we must install them using this command:
```
npm install
```

To run the application use this command:
```
npm run devStart
```

To build the application for deployment use this command:
```
node index.js
```

## Management of Folder & Files

- [Controllers](https://github.com/EddyEduard/ShopCart/tree/main/controllers)
- [Models](https://github.com/EddyEduard/ShopCart/tree/main/models)
- [Views](https://github.com/EddyEduard/ShopCart/tree/main/views)
- [Middlewares](https://github.com/EddyEduard/ShopCart/tree/main/middlewares)
- [Routes](https://github.com/EddyEduard/ShopCart/tree/main/routes)
- [Helpers](https://github.com/EddyEduard/ShopCart/tree/main/helpers)
- [Public](https://github.com/EddyEduard/ShopCart/tree/main/public)

## Database

The database used for data storage is **MongoDB**.

### Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMER {
        string id PK
        string(3) first_name
        string(3) last_name
        string(10) email
        string password
        string(10) phone
        string image
        ADDRESS address
        CARD card
        object metadata
        date created_date
    }
    PRODUCT {
        string id PK
        string(5) name
        string description
        string[] images
        number price
        number discount
        number stock
        date created_date
    }
    CART {
        string id PK
        string customer_id FK
        ITEM[] items
    }
    ORDER {
        string id PK
        string customer_id FK
        enum status
        ITEM[] items
        date created_date
    }
    REVIEW {
        string id PK
        string customer_id FK
        string product_id FK
        string(10) title
        string content
        date created_date
    }
    ADDRESS {
        string country
        string state
        string city
        string street
        string postal_code
        string vat_type
        string vat_code
    }
    CARD {
        string name
        string brand
        string last4
        integer exp_month
        integer exp_year
    }
    ITEM {
        string product_id FK
        number quantity
    }

    CUSTOMER ||--|| ADDRESS : "has address"
    CUSTOMER ||--|| CARD : "has card"
    CUSTOMER ||--|| CART : "has cart"
    CUSTOMER ||--o{ ORDER : "has orders"
    CUSTOMER ||--o{ REVIEW : "has reviews"

    PRODUCT ||--o{ REVIEW : "has reviews"

    CART ||--o{ ITEM : "has products"

    ORDER ||--o{ ITEM : "has products"

    ITEM }o--o{ PRODUCT : "products"
```

## License
Distributed under the MIT License. See [MIT](https://github.com/EddyEduard/ShopCart/blob/master/LICENSE) for more information.

## Contact
Eduard-Nicolae - [eduard_nicolae@yahoo.com](mailTo:eduard_nicolae@yahoo.com)
\
Project link - [https://github.com/EddyEduard/ShopCart](https://github.com/EddyEduard/ShopCart.git)
