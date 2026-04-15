import { z } from 'zod'

export const bookingDetailsSchema = z.object({
  customerName: z.string().min(2, 'Imię i nazwisko musi mieć minimum 2 znaki.'),
  customerEmail: z.string().email('Podaj poprawny adres e-mail.'),
  customerPhone: z
    .string()
    .min(7, 'Numer telefonu jest za krótki.')
    .max(15, 'Numer telefonu jest za długi.')
    .regex(
      /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
      'Niepoprawny format numeru telefonu.',
    )
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500, 'Uwagi nie mogą być dłuższe niż 500 znaków.').optional(),
})
