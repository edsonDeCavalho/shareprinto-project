import { z } from 'zod';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = ['model/stl', 'application/vnd.ms-pki.stl', 'application/sla', ''];

// Use z.any() with refine to avoid File API access during build
const fileSchema = typeof File !== 'undefined' 
  ? z.instanceof(File)
  : z.any().refine((val) => val && typeof val === 'object' && 'name' in val && 'size' in val, 'Invalid file');

export const UploadSchema = z.object({
  stlFiles: z
    .array(fileSchema)
    .min(1, 'At least one STL file is required.')
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 50MB.`)
    .refine(
      (files) => files.every((file) => ACCEPTED_FILE_TYPES.includes(file.type)),
      'Only .stl files are accepted.'
    ),
  material: z.string().min(1, 'Material is required.'),
  printerType: z.string().min(1, 'Printer type is required.'),
});

export type UploadValues = z.infer<typeof UploadSchema>;

// Order creation schema
export const CreateOrderSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  materialType: z.string().min(1, 'Material type is required'),
  typeOfPrinting: z.string().min(1, 'Type of printing is required'),
  multiplePrints: z.boolean().default(false),
  numberOfPrints: z.number().min(1, 'Number of prints must be at least 1'),
  typeOfDelivery: z.enum(['mail', 'in_person', 'farmer_delivery']),
  cost: z.number().min(0, 'Cost must be non-negative').optional(),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute').optional(),
  recuperationCode: z.number().min(1000, 'Recuperation code must be 4 digits').max(9999, 'Recuperation code must be 4 digits').optional(),
  stlFiles: z
    .array(fileSchema)
    .min(1, 'At least one STL file is required')
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 50MB.`)
    .refine(
      (files) => files.every((file) => ACCEPTED_FILE_TYPES.includes(file.type)),
      'Only .stl files are accepted.'
    ),
  locationData: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    city: z.string().min(1, 'City is required'),
  }),
});

export type CreateOrderValues = z.infer<typeof CreateOrderSchema>;
