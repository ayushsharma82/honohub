import type { Env, Hono, Schema } from "hono";
import type { ExtendedTableConfig, SanitizedCollection } from "./collection";

export type AppConfig<
  Database,
  E extends Env,
  P extends Schema,
  I extends string,
> = Partial<SanitizedApp<Database, E, P, I>> & {
  db: Database;
};

export type SanitizedApp<
  Database,
  E extends Env,
  P extends Schema,
  I extends string,
> = {
  db: Database;
  collections: SanitizedCollection[];
  plugins: ((
    app: Hono<E, P, I>,
    config: SanitizedApp<Database, E, P, I>,
  ) => Hono<E, P, I>)[];
};
