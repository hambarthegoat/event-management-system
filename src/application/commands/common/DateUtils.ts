import type { ISODateString } from '../../dtos/common';
import { ValidationError } from './ApplicationErrors';

export function parseISODate(value: ISODateString): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError(`Invalid ISO date string: '${value}'.`);
  }
  return d;
}

export function toISODateString(d: Date): ISODateString {
  return d.toISOString();
}
