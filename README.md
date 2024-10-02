Aplicativo simples feito em 

Next.js 14

Supabase

TailWind

Possui Autenticação e confirmação por email

Ativação do usuário por outro usuário ativo.

Cadastro de Pessoas

Cadastro de Atendentes

Cadastro de Tipo Atendimento

Cadastro de Atendimentos



hospedado na vercel

https://cejoana.vercel.app/



Repositório git

https://github.com/safesistemas/cejoana



baseiei o inicio do desenvolvimento clonando de

https://github.com/supabase/supabase/tree/master/examples/user-management



segui o passo a passo e fiz as alterações posteriormente



-- Create a table for public profiles

create table profiles (

  id uuid references auth.users not null primary key,
  
  updated_at timestamp with time zone,
  
  username text unique,
  
  full_name text,
  
  avatar_url text,
  
  website text,
  
  ativo boolean not null default false,
  
  constraint username_length check (char_length(username) >= 3)
);


-- Set up Row Level Security (RLS)

-- See https://supabase.com/docs/guides/auth/row-level-security for more details.

alter table profiles

  enable row level security;



create policy "Public profiles are viewable by everyone." on profiles

  for select using (true);



create policy "Users can insert their own profile." on profiles

  for insert with check ((select auth.uid()) = id);



create policy "Users can update own profile." on profiles

  for update using ((select auth.uid()) = id);



-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.

-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.

create function public.handle_new_user()

returns trigger as $$

begin

  insert into public.profiles (id, full_name, username, avatar_url)
  
  values (new.id, new.email, new.email, new.raw_user_meta_data->>'avatar_url');
  
  return new;
en
d;

$$ language plpgsql security definer;

create trigger on_auth_user_created

  after insert on auth.users
  
  for each row execute procedure public.handle_new_user();



-- Set up Storage!

insert into storage.buckets (id, name)

  values ('avatars', 'avatars');



-- Set up access controls for storage.

-- See https://supabase.com/docs/guides/storage#policy-examples for more details.

create policy "Avatar images are publicly accessible." on storage.objects

  for select using (bucket_id = 'avatars');



create policy "Anyone can upload an avatar." on storage.objects

  for insert with check (bucket_id = 'avatars');



create policy "Anyone can update their own avatar." on storage.objects

  for update using ( auth.uid() = owner ) with check (bucket_id = 'avatars');

  



create table

  public.atendentes (
  
    id bigint generated always as identity not null,
    
    nome text not null,
    
    telefone text null,
    
    constraint atendentes_pkey primary key (id)
  ) 
  tablespace pg_default;



create table

  public.cidades (
  
    id bigint generated always as identity not null,
    
    nome text not null,
    
    uf text not null,
    
    constraint cidades_pkey primary key (id)
  ) 
  tablespace pg_default;



create table

  public.pessoas (
  
    id bigint generated always as identity not null,
    
    nome text not null,
    
    telefone text null,
    
    idade integer null,
    
    sexo text null,
    
    endereco text null,
    
    bairro text null,
    
    cidade_id bigint null,
    
    constraint pessoas_pkey primary key (id),
    
    constraint pessoas_cidade_id_fkey foreign key (cidade_id) references cidades (id)
  ) 
  tablespace pg_default;



create table

  public.tipo_atendimento (
  
    id bigint generated always as identity not null,
    
    descricao_atendimento text not null,
    
    constraint tipo_atendimento_pkey primary key (id)
  ) 
  tablespace pg_default;

  
cr
eate table

  public.atendimentos (
  
    id bigint generated always as identity not null,
    
    pessoa_id bigint null,
    
    atendente_id bigint null,
    
    data_atendimento timestamp with time zone not null,
    
    tipo_atendimento_id bigint null,
    
    orientacao text null,
    
    observacao text null,
    
    constraint atendimentos_pkey primary key (id),
    
    constraint atendimentos_atendente_id_fkey foreign key (atendente_id) references atendentes (id),
    
    constraint atendimentos_pessoa_id_fkey foreign key (pessoa_id) references pessoas (id),
    
    constraint atendimentos_tipo_atendimento_id_fkey foreign key (tipo_atendimento_id) references tipo_atendimento (id)
  ) 
  tablespace pg_default;
