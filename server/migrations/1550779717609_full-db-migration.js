exports.up = pgm => {
  //1. Users Table
  pgm.sql(`
    CREATE TABLE "foostown"."users" (
      "id" SERIAL PRIMARY KEY,
      "fullname" TEXT NOT NULL,
      "email" TEXT UNIQUE NOT NULL,
      "password" TEXT NOT NULL
    );
  `),
    //2. Teams Table
    pgm.sql(`
    CREATE TABLE "foostown"."teams" (
      "id" SERIAL PRIMARY KEY,
      "team_name" TEXT NOT NULL,
      "organization_id" TEXT NOT NULL,
      UNIQUE(team_name, organization_id)
    );
  `),
    //3. Organizations Table
    pgm.sql(`
    CREATE TABLE "foostown"."organizations" (
      "id" SERIAL PRIMARY key,
      "name" text UNIQUE NOT NULL,
      "is_active" BOOLEAN NOT NULL,
      "owner_id" INTEGER REFERENCES users(id) NOT NULL
    );
  `),
    //4. Organizations_Users Table
    pgm.sql(`
    CREATE TABLE "foostown"."organizations_users" (
      "organization_id" INTEGER REFERENCES organizations (id) NOT NULL,
      "user_id" INTEGER REFERENCES users (id) NOT NULL,
      "is_admin" BOOLEAN NOT NULL
    );
  `),
    //5. Teams_Users Table
    pgm.sql(`
    CREATE TABLE "foostown"."teams_users" (
      "user_id" INTEGER REFERENCES users (id) NOT NULL,
      "team_id" INTEGER REFERENCES teams (id) NOT NULL
    );
  `),
    //6. Tournaments Table
    pgm.sql(`
    CREATE TABLE "foostown"."tournaments" (
      "id" SERIAL PRIMARY KEY,
      "tournament_name" TEXT NOT NULL,
      "organization_id" INTEGER REFERENCES organizations (id) NOT NULL,
      "start_date" DATE NOT NULL,
      "end_date" DATE,
      "status" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "creator" INTEGER REFERENCES users (id) NOT NULL,
      UNIQUE (tournament_name, organization_id)
    );
  `),
    //7. Matches Table
    pgm.sql(`
    CREATE TABLE "foostown"."matches" (
      "id" SERIAL PRIMARY key,
      "organization_id" INTEGER REFERENCES organizations(id) NOT NULL,
      "tournament_id" INTEGER REFERENCES tournaments(id)
    );
  `),
    //8. Teams_Matches Table
    //Needs more columns for STATS!!!
    pgm.sql(`
    CREATE TABLE "foostown"."teams_matches" (
      "match_id" INTEGER REFERENCES matches(id) NOT NULL,
      "team_id" INTEGER REFERENCES teams(id),
      "goals_for" INTEGER,
      "goals_against" INTEGER
    );
  `),
    //9. Teams_Tournaments Table
    pgm.sql(`
    CREATE TABLE "foostown"."teams_tournaments" (
      "id" SERIAL PRIMARY key,
      "tournament_id" INTEGER REFERENCES tournaments(id) NOT NULL,
      "team_id" INTEGER REFERENCES teams(id),
      "points" INTEGER NOT NULL,
      "brackets" INTEGER
    );
  `),
    //10. Elimination_Nodes Table
    pgm.sql(`
  CREATE TABLE "foostown"."elimination_nodes" (
    "id" SERIAL PRIMARY KEY,
    "bracket" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "tournament_id" INTEGER REFERENCES tournaments(id) NOT NULL,
    "match_id" INTEGER REFERENCES matches(id) NOT NULL,
    "team_id" INTEGER REFERENCES teams(id) NOT NULL,
    UNIQUE ("bracket", "position", "tournament_id")
  );
`)
}
