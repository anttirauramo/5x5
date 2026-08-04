create table users (
    id bigint unsigned auto_increment primary key,
    username varchar(64) not null unique,
    created_at timestamp default current_timestamp
) ENGINE=InnoDB;
