import { registerDecorator } from "class-validator";

export function IsBirthDate(): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: "isBirthDate",
      target: target.constructor,
      propertyName: String(propertyKey),
      options: {
        message: "birthDate must be a valid YYYY-MM-DD date, not in the future",
      },
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
            return false;
          const date = new Date(`${value}T00:00:00.000Z`);
          return (
            !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value &&
            value <= new Date().toISOString().slice(0, 10)
          );
        },
      },
    });
  };
}
