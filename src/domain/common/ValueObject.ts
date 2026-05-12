export abstract class ValueObject<TProps> {
 protected readonly props: Readonly<TProps>;
 
  protected constructor(props: TProps) {
   this.props = Object.freeze({...props});
  }

  public equals(other?: ValueObject<TProps>): boolean {
    if (other === null || other == undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}