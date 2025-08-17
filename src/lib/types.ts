import { z } from "zod";

export const vehicleTypes = ["SUV", "Truck", "Sedan", "Van", "Motorcycle"] as const;
export const vehicleAvailabilities = ["Available", "Rented"] as const;

export const vehicleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(vehicleTypes),
  year: z.coerce.number().min(1900, "Year must be 1900 or later.").max(new Date().getFullYear() + 1, `Year cannot be in the future.`),
  price: z.coerce.number().positive("Price must be a positive number."),
  availability: z.enum(vehicleAvailabilities),
});

export type Vehicle = z.infer<typeof vehicleSchema>;
