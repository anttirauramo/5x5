create table completions (
    id bigint unsigned auto_increment primary key,
    user_id bigint unsigned not null,
    grid varchar(64) not null,
    wordlist varchar(64) not null,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id)
) ENGINE=InnoDB;
