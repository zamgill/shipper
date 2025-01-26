export function safeStringy(obj: unknown) {
  try {
    if (obj instanceof Error) {
      return JSON.stringify(obj.stack ?? obj.message);
    }

    return JSON.stringify(obj);
  } catch (e) {
    return obj;
  }
}
