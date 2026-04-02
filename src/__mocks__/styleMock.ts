const styleMock: Record<string, string> = new Proxy({}, { get: (_, key) => String(key) });
export default styleMock;
