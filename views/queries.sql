CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    password VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE blogs (
    blog_id SERIAL PRIMARY KEY,
    creator_name VARCHAR(255),
    creator_user_id int REFERENCES users(user_id),
    title VARCHAR(255),
    body TEXT,
    date_created TIMESTAMP
);
