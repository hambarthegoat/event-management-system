export abstract class Entity<TId = string> {
  protected constructor(protected readonly _id: TId) {}
  get id(): TId{
    return this._id;
  }

  public equals(other?: Entity<TId>): boolean {
    if (other === null || other == undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return this._id === other._id;
  }
} 