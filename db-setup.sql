DROP TABLE IF EXISTS representatives;

CREATE TABLE representatives (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    quote VARCHAR(255),
    party VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS petitions;

CREATE TABLE petitions (
    id SERIAL primary key NOT NULL,
    user_id INT NOT NULL,
    petition VARCHAR(255) NOT NULL,
    signature_url VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



