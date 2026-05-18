import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LeadSource } from '../lead-source.enum';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Lead {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: String, default: null })
  phone!: string | null;

  @Prop({ type: String, required: true, enum: Object.values(LeadSource) })
  source!: LeadSource;

  @Prop({ type: String, default: null })
  productInterest!: string | null;

  @Prop({ type: Number, default: null })
  budget!: number | null;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  @Prop()
  created_at!: Date;

  @Prop()
  updated_at!: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ source: 1, created_at: -1 });
LeadSchema.index({ deletedAt: 1 });
LeadSchema.index({ email: 1 }, { unique: true });
