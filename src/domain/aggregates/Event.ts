import { createEmitAndSemanticDiagnosticsBuilderProgram } from "typescript";
import { AggregateRoot } from "../common/AggregateRoot";
import { Entity } from "../common/Entity";
import { Money } from "../value-objects/Money";

export enum TicketCategoryStatus {
  Active = "active",
  Disabled = "disabled",
}

interface TicketCategoryProps {
  readonly name: string;
  readonly price: Money;
  readonly quota: number;
  readonly salesStartDate: Date;
  readonly salesEndDate: Date;
}

export class TicketCategory extends Entity<string> {
  private _status: TicketCategoryStatus;

  constructor(
    id: string,
    private readonly _props: TicketCategoryProps,
    status: TicketCategoryStatus = TicketCategoryStatus.Active,
  ) {
    super(id);
    this._status = status;
  }
  get name(): string { return this._props.name; }
  get price(): Money { return this._props.price; }
  get quota(): number { return this._props.quota; }
  get salesStartDate(): Date { return this._props.salesStartDate; }
  get salesEndDate(): Date { return this._props.salesEndDate; }
  get status(): TicketCategoryStatus { return this._status; }
  get isActive(): boolean { return this._status === TicketCategoryStatus.Active; }

  public isSalesOpen(at: Date = new Date()): boolean {
    return this.isActive && at >= this.salesStartDate && at <= this.salesEndDate;
  }

  public disable(): void {
    this._status = TicketCategoryStatus.Disabled;
  }
}

}