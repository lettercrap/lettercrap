import { z } from 'zod';

export const NonBlankStringSchema = z.string().refine((val) => val.trim().length > 0);
export const FontWeightSchema = z.union([
  z.literal('100'),
  z.literal('200'),
  z.literal('300'),
  z.literal('400'),
  z.literal('500'),
  z.literal('600'),
  z.literal('700'),
  z.literal('800'),
  z.literal('900'),
  z.literal('lighter'),
  z.literal('normal'),
  z.literal('bold'),
  z.literal('bolder'),
]);
export const UpdateIntervalSchema = z.number().nonnegative();
export const WordsSchema = z.array(NonBlankStringSchema);
export const FontFamilySchema = z.string();
export const ConfigSchema = z.object({
  content: NonBlankStringSchema,
  letters: NonBlankStringSchema,
  words: WordsSchema,
  font_family: FontFamilySchema,
  font_weight: FontWeightSchema,
  update_interval: UpdateIntervalSchema,
});
