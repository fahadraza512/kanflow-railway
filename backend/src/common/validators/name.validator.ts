import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for entity names (workspace, project, board, task)
 * Allows only: letters, numbers, spaces, hyphens (-), and underscores (_)
 * Disallows: special characters and symbols
 */
export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Only allow letters, numbers, spaces, hyphens, and underscores
          const allowedPattern = /^[a-zA-Z0-9\s\-_]+$/;
          return allowedPattern.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} can only contain letters, numbers, spaces, hyphens (-), and underscores (_). Special characters and symbols are not allowed.`;
        },
      },
    });
  };
}
