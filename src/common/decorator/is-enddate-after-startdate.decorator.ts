import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function validateTime<T>(
  endDateValue: T,
  args: ValidationArguments,
): boolean {
  const target = args.object as any; // Mengambil seluruh object DTO yang sedang divalidasi

  const startDate = target.startDate;
  const startTime = target.startTime;
  const endTime = target.endTime;

  // Jika salah satu data belum diisi, lewati validasi (biarkan validator seperti @IsNotEmpty yang menangani)
  if (!startDate || !startTime || !endDateValue || !endTime) {
    return true;
  }

  // Gunakan format ISO yang valid agar aman di semua environment (Node.js/Browser)
  const startDateTime = new Date(`${startDate}T${startTime}:00`);
  const endDateTime = new Date(`${endDateValue}T${endTime}:00`);

  // Pastikan tanggal valid sebelum dibandingkan
  if (isNaN(startDateTime.getTime()) || !isNaN(endDateTime.getTime())) {
    return endDateTime > startDateTime;
  }

  return false;
}

export function IsEndDateAfterStartDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEndDateAfterStartDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: validateTime,
        defaultMessage: () =>
          'end date and time must be greater than start date and time',
      },
    });
  };
}

