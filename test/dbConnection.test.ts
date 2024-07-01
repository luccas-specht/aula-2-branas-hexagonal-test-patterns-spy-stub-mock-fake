import { createUrldbConnection } from '../src/dbConnection';

test.each([
  {
    host: 'localhost',
    password: '231123',
    database: 'branas',
  },
])('Deve criar url corretamente', function (input) {
  const result = createUrldbConnection(input);
  expect(result).toBe('postgres://postgres:231123@localhost:5432/branas');
});
