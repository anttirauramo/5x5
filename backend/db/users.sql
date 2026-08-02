create table users (
    id serial primary key,
    username varchar(64) not null,
    created_at timestamp default current_timestamp
);
