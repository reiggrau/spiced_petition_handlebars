DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
    name VARCHAR(255) NOT NULL CHECK (name != ''),
    country VARCHAR(255) NOT NULL CHECK (country != ''),
    population INT NOT NULL
);



