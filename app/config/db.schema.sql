create schema public;

-- each property is attached to a building (1 to 1)

create type public.city as ENUM ('Dubai', 'Montreal');
create table public.building (
    id bigserial primary key not null,
    city public.city not null
);

insert into public.building (city) values ('Dubai');
insert into public.building (city) values ('Montreal');

-- properties/units
-- supported amenities on units, we'll use this for additional filtering
create type public.amenities_enum as ENUM ('WiFi', 'Pool', 'Garden', 'Tennis table', 'Parking');
create type public.property_type_enum as ENUM ('1bdr', '2bdr', '3bdr');

create table public.property (
    id bigserial primary key not null,
    building_id bigint references public.building on delete cascade not null,
    title text unique not null,
    property_type public.property_type_enum not null,
    amenities public.amenities_enum[] not null
);

insert into public.property (building_id, title, property_type, amenities) VALUES (1, 'Unit 1', '1bdr', '{WiFi,Parking}');
insert into public.property (building_id, title, property_type, amenities) VALUES (1, 'Unit 2', '2bdr', '{WiFi,Tennis table}');
insert into public.property (building_id, title, property_type, amenities) VALUES (1, 'Unit 3', '3bdr', '{Garden}');
insert into public.property (building_id, title, property_type, amenities) VALUES (2, 'Unit 4', '1bdr', '{Garden,Pool}');


-- reservations per unit
create table public.reservation (
    id bigserial primary key not null,
    check_in date not null,
    check_out date not null,
    property_id bigint references public.property on delete cascade not null
);

insert into public.reservation (check_in, check_out, property_id) VALUES ('2021-05-01', '2021-05-10', 1);
insert into public.reservation (check_in, check_out, property_id) VALUES ('2021-06-01', '2021-06-03', 1);
insert into public.reservation (check_in, check_out, property_id) VALUES ('2021-06-02', '2021-06-07', 2);


-- manual availability settings
create table public.availability (
    id bigserial primary key not null,
    property_id bigint references public.property on delete cascade not null,
    start_date date not null,
    end_date date not null,
    is_blocked boolean default false
);

-- Note: when checking a unit availability, query both public.reservation & public.availability, if a unit has a reservation on an overlapping date range, or if it's
-- manually blocked (for example: for maintenance) and has an entry with is_blocked set to true with an overlapping start_date & end_date in public.availability

insert into public.availability (property_id, start_date, end_date, is_blocked) values (1, '2021-07-01', '2021-07-20', true);