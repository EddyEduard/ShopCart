const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Review = require("../models/review.model");

// Generate a random customer.
const generateRandomCustomer = async _ => {
    const salt = await bcrypt.genSaltSync();

    return new Customer({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number("07########"),
        password: await bcrypt.hashSync(faker.internet.password(), salt),
        image: faker.image.urlLoremFlickr({ width: 50, height: 50, category: "people" }),
        address: {
            country: faker.location.country(),
            state: faker.location.state(),
            city: faker.location.city(),
            street: faker.location.street(),
            vat_type: "",
            vat_code: ""
        },
        card: {
            name: faker.person.fullName(),
            brand: faker.finance.creditCardIssuer(),
            last4: faker.finance.creditCardNumber().slice(-4),
            exp_month: faker.date.anytime().getMonth(),
            exp_year: faker.date.anytime().getFullYear()
        },
        metadata: {
            has_payment_method_added: false
        },
        created_date: faker.date.between({ from: '2023-01-01T00:00:00.000Z', to: '2023-12-31T00:00:00.000Z' })
    });
};

// Generate a random product.
const generateRandomProduct = _ => {
    return new Product({
        name: faker.commerce.productName(),
        description: faker.lorem.sentence({ min: 30, max: 100 }),
        images: Array.from(new Array(faker.number.int({ min: 3, max: 10 })), (_, index) => faker.image.urlLoremFlickr({ width: index == 0 ? 450 : 600, height: index == 0 ? 300 : 700, category: "cars" })),
        price: parseFloat(faker.commerce.price()),
        discount: parseFloat(faker.number.float({ min: 0, max: 45 }).toFixed(2)),
        stock: faker.number.int({ min: 0, max: 300 }),
        created_date: faker.date.between({ from: '2023-01-01T00:00:00.000Z', to: '2023-12-31T00:00:00.000Z' })
    });
};

// Generate a random review for a product.
const generateRandomReviewForProduct = (customerId, productId) => {
    return new Review({
        customer_id: customerId,
        product_id: productId,
        title: faker.lorem.sentence({ min: 3, max: 5 }),
        content: faker.lorem.sentence({ min: 10, max: 50 }),
        rating: faker.number.int({ min: 1, max: 5 }),
        created_date: faker.date.between({ from: '2023-01-01T00:00:00.000Z', to: '2023-12-31T00:00:00.000Z' })
    });
};

// Generate random customers.
exports.generateRandomCustomers = async (count, saveInDatabase = false) => {
    const customers = [];
    let customer = null;

    if (saveInDatabase)
        await Customer.deleteMany({});

    for (let i = 0; i < count; i++) {
        customer = await generateRandomCustomer();

        if (saveInDatabase)
            await customer.save();

        customers.push(customer);
    }

    return customers;
};

// Generate random products.
exports.generateRandomProducts = async (count, saveInDatabase = false) => {
    const products = [];
    let product = null;

    if (saveInDatabase)
        await Product.deleteMany({});

    for (let i = 0; i < count; i++) {
        product = generateRandomProduct();

        if (saveInDatabase)
            await product.save();

        products.push(product);
    }

    return products;
};

// Generate random reviews for products.
exports.generateRandomReviewForProducts = async (count, customers, products, saveInDatabase = false) => {
    const reviews = [];
    let customer = null, product = null, review = null;

    if (saveInDatabase)
        await Review.deleteMany({});

    for (let i = 0; i < count; i++) {
        customer = customers[faker.number.int({ min: 0, max: customers.length - 1 })];
        product = products[faker.number.int({ min: 0, max: products.length - 1 })];

        if (customer != undefined && product != undefined) {
            review = generateRandomReviewForProduct(customer.id, product.id);

            if (saveInDatabase)
                await review.save();

            reviews.push(review);
        }
    }

    return reviews;
};