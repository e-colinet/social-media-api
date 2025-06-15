CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" text not null,
  "queue" text not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "social_media_profiles"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "platform" varchar not null,
  "platform_user_id" varchar not null,
  "username" varchar,
  "display_name" varchar,
  "profile_url" varchar,
  "avatar_url" varchar,
  "bio" text,
  "additional_data" text,
  "is_active" tinyint(1) not null default '1',
  "last_synced_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade
);
CREATE UNIQUE INDEX "social_media_profiles_user_id_platform_unique" on "social_media_profiles"(
  "user_id",
  "platform"
);
CREATE TABLE IF NOT EXISTS "oauth_auth_codes"(
  "id" varchar not null,
  "user_id" integer not null,
  "client_id" varchar not null,
  "scopes" text,
  "revoked" tinyint(1) not null,
  "expires_at" datetime,
  primary key("id")
);
CREATE INDEX "oauth_auth_codes_user_id_index" on "oauth_auth_codes"("user_id");
CREATE TABLE IF NOT EXISTS "oauth_access_tokens"(
  "id" varchar not null,
  "user_id" integer,
  "client_id" varchar not null,
  "name" varchar,
  "scopes" text,
  "revoked" tinyint(1) not null,
  "created_at" datetime,
  "updated_at" datetime,
  "expires_at" datetime,
  primary key("id")
);
CREATE INDEX "oauth_access_tokens_user_id_index" on "oauth_access_tokens"(
  "user_id"
);
CREATE TABLE IF NOT EXISTS "oauth_refresh_tokens"(
  "id" varchar not null,
  "access_token_id" varchar not null,
  "revoked" tinyint(1) not null,
  "expires_at" datetime,
  primary key("id")
);
CREATE INDEX "oauth_refresh_tokens_access_token_id_index" on "oauth_refresh_tokens"(
  "access_token_id"
);
CREATE TABLE IF NOT EXISTS "oauth_clients"(
  "id" varchar not null,
  "owner_type" varchar,
  "owner_id" integer,
  "name" varchar not null,
  "secret" varchar,
  "provider" varchar,
  "redirect_uris" text not null,
  "grant_types" text not null,
  "revoked" tinyint(1) not null,
  "created_at" datetime,
  "updated_at" datetime,
  primary key("id")
);
CREATE INDEX "oauth_clients_owner_type_owner_id_index" on "oauth_clients"(
  "owner_type",
  "owner_id"
);
CREATE TABLE IF NOT EXISTS "oauth_device_codes"(
  "id" varchar not null,
  "user_id" integer,
  "client_id" varchar not null,
  "user_code" varchar not null,
  "scopes" text not null,
  "revoked" tinyint(1) not null,
  "user_approved_at" datetime,
  "last_polled_at" datetime,
  "expires_at" datetime,
  primary key("id")
);
CREATE INDEX "oauth_device_codes_user_id_index" on "oauth_device_codes"(
  "user_id"
);
CREATE INDEX "oauth_device_codes_client_id_index" on "oauth_device_codes"(
  "client_id"
);
CREATE UNIQUE INDEX "oauth_device_codes_user_code_unique" on "oauth_device_codes"(
  "user_code"
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2025_06_13_035505_create_social_media_profiles_table',1);
INSERT INTO migrations VALUES(5,'2025_06_13_122729_create_oauth_auth_codes_table',1);
INSERT INTO migrations VALUES(6,'2025_06_13_122730_create_oauth_access_tokens_table',1);
INSERT INTO migrations VALUES(7,'2025_06_13_122731_create_oauth_refresh_tokens_table',1);
INSERT INTO migrations VALUES(8,'2025_06_13_122732_create_oauth_clients_table',1);
INSERT INTO migrations VALUES(9,'2025_06_13_122733_create_oauth_device_codes_table',1);
