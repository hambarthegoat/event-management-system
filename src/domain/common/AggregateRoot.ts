import { Entity } from "./Entity";
import type { DomainEvent } from "./DomainEvent";

export abstract class AggregateRoot<Tid = string> extends Entity<Tid> {
  private _domainEvents: DomainEvent[] = [];
  
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}