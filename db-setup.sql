DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS petitions;
DROP TABLE IF EXISTS representatives;

CREATE TABLE representatives (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES representatives (id),
    image_url VARCHAR(255),
    quote VARCHAR(255),
    party VARCHAR(255)
);


CREATE TABLE petitions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES representatives (id),
    title VARCHAR(255) NOT NULL,
    petition VARCHAR(510) NOT NULL,
    signature_url VARCHAR NOT NULL,
    topic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



