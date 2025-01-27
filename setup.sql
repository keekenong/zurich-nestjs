DROP TABLE IF EXISTS "PRODUCT";

-- Create products table
CREATE TABLE "PRODUCT"
(
    id SERIAL PRIMARY KEY,
    product_code INT,
    product_description VARCHAR(100),
    location VARCHAR(100),
    price INT
);

-- Insert data into products table
INSERT INTO "PRODUCT"
    (product_code, product_description, location, price)
VALUES
    (1000, 'Sedan', 'West Malaysia', 300),
    (1000, 'Sedan', 'East Malaysia', 450),
    (2000, 'SUV', 'West Malaysia', 500),
    (2000, 'SUV', 'East Malaysia', 650)