import { ValueObject } from "../common/ValueObject";
import { InvalidPaymentException } from "../exceptions/DomainExceptions";

interface MoneyProps {
  readonly amount: number;
  readonly currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    if (props.amount < 0) {
      throw new InvalidPaymentException(
        `Money amount cannot be negative: ${props.amount}`
      );
    }
    super(props);
  }

  public static of(amount: number, currency: string = 'IDR'): Money {
    return new Money({ amount, currency });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  public add(other: Money): Money{
    this.assertSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }
  
  public multiply(factor: number): Money{
    if (factor < 0) {
      throw new InvalidPaymentException(
        `multiply factor cannot be negative: ${factor}`
      )
    }
    return Money.of(this.amount * factor, this.currency)
  }

  public isEqualTo(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  public assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency)
      throw new InvalidPaymentException(
        `Currencies mismatch: ${this.currency} vs ${other.currency}`,
      );
  }

  public override toString(): string {
    return `${this.currency} ${this.amount.toLocaleString()}`;
  }
}