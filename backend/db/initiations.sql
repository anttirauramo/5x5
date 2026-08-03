create table initiations (
    id bigint unsigned auto_increment primary key,
    user_id bigint unsigned,
    wordlist varchar(64) not null,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id)
) ENGINE=InnoDB;
