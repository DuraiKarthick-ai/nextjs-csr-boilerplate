export const getToken = jest.fn(async () => "mock-access-token");
export const setToken = jest.fn();
export const clearToken = jest.fn();
export const hasValidToken = jest.fn(() => true);
