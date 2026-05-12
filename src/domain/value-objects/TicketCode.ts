import { randomUUID } from 'crypto';
import { ValueObject } from '../common/ValueObject';

interface TicketCodeProps {
  readonly code: string;
}

export class TicketCode extends ValueObject<TicketCodeProps> {
  private constructor(props: TicketCodeProps) {
    if (!props.code || props.code.trim() === '') {
      throw new Error('Ticket code cannot be empty.');
    }
    super(props);
  }

  public static generate(): TicketCode {
    return new TicketCode({ code: randomUUID() });
  }

  public static of(code: string): TicketCode {
    return new TicketCode({ code });
  }

  get value(): string {
    return this.props.code;
  }

  public override toString(): string {
    return this.props.code;
  }
}