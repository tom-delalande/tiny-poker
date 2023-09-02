export const writable = () => {
  return {
    subscribe: (_) => {},
    set: (_) => {},
  };
};

export class NoOpWritable {
  subscribe(_) {}
}
