CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_number" serial NOT NULL,
	"name" text NOT NULL,
	"avatar" text NOT NULL,
	"is_eliminated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
