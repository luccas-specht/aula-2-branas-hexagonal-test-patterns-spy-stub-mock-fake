type Params = {
  databaseManagement?: string;
  user?: string;
  host: string;
  password: string;
  database: string;
  port?: string;
};
export function createUrldbConnection({
  database,
  host,
  password,
  user = 'postgres',
  databaseManagement = 'postgres',
  port = '5432',
}: Params) {
  const url = `${databaseManagement}://${user}:${password}@${host}:${port}/${database}`;
  return url;
}
