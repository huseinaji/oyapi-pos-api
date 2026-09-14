export abstract class BaseAdapter<T> {
  protected readonly adapter: T;

  constructor(adapter: T) {
    this.adapter = adapter;
  }
}