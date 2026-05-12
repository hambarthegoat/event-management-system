import { AggregateRoot } from "../common/AggregateRoot";
import { Entity } from "../common/Entity";
import type { Money } from "../value-objects/Money";
import {
  InvalidCapacityException,
  InvalidDateException,
  InvalidStateException
} from "../exceptions/DomainExceptions"
import {
  TicketCategoryCreated,
  TicketCategoryDisabled
} from "../events/Eventevents"

export enum TicketStatus {
  Active = "active",
  CheckedIn = "CheckedIn",
  CheckedOut = "CheckedOut",
}
}