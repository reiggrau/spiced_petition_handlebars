DROP TABLE IF EXISTS representatives;

CREATE TABLE representatives (
    id SERIAL primary key NOT NULL,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name != ''),
    image_url VARCHAR(255) NOT NULL CHECK (image_url != ''),
    quote VARCHAR(255) NOT NULL CHECK (quote != ''),
    signature TEXT
);

DROP TABLE IF EXISTS petitions;

CREATE TABLE petitions (
    id SERIAL primary key NOT NULL,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name != ''),
    petition VARCHAR(255) NOT NULL CHECK (petition != ''),
    signature_url VARCHAR NOT NULL CHECK (signature_url != '')
);



