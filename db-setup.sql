DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key NOT NULL,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name != ''),
    quote VARCHAR(255) NOT NULL CHECK (quote != ''),
    signature TEXT
);



