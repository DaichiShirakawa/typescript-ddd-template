export function wait(wait_ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, wait_ms));
}
