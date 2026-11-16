import { z } from "zod";
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/constants";

export const propertySchema = z.object({
  title: z.string().trim().min(3, "Enter at least 3 characters").max(150, "Keep the title under 150 characters"),
  propertyType: z.enum(PROPERTY_TYPES, { errorMap: () => ({ message: "Choose a property type" }) }),
  status: z.enum(PROPERTY_STATUSES, { errorMap: () => ({ message: "Choose a status" }) }),
  price: z.coerce.number({ invalid_type_error: "Enter a valid price" }).min(1, "Enter the price"),
  area: z.coerce.number({ invalid_type_error: "Enter a valid area" }).min(1, "Enter the area in sq ft"),
  location: z.string().trim().min(2, "Enter the locality").max(120, "Keep the locality under 120 characters"),
  address: z.string().trim().min(5, "Enter the complete address").max(300, "Keep the address under 300 characters"),
  description: z.string().trim().max(3000, "Keep the description under 3000 characters"),
  ownerName: z.string().trim().min(2, "Enter the owner's name").max(100),
  ownerPhone: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\+?[0-9\s-]{7,15}$/.test(v), "Enter a valid phone number"),
  notes: z.string().trim().max(3000, "Keep notes under 3000 characters"),
  followUpDate: z.string(),
});

export const emptyPropertyValues = {
  title: "",
  propertyType: "House",
  status: "Available",
  price: "",
  area: "",
  location: "",
  address: "",
  description: "",
  ownerName: "",
  ownerPhone: "",
  notes: "",
  followUpDate: "",
};
