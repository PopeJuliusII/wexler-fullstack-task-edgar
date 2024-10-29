// Mock console.error to suppress error messages during tests.
const originalError = console.error;

beforeAll(() => {
  console.error = () => {};
});

afterAll(() => {
  console.error = originalError;
});
