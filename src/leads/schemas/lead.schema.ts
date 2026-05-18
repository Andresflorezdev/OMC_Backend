import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LeadSource } from '../lead-source.enum';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Lead {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ default: null })
  phone!: string | null;

  @Prop({ required: true, enum: Object.values(LeadSource) })
  source!: LeadSource;

  @Prop({ default: null })
  productInterest!: string | null;

  @Prop({ type: Number, default: null })
  budget!: number | null;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ source: 1, createdAt: -1 });
LeadSchema.index({ deletedAt: 1 });
LeadSchema.index({ email: 1 }, { unique: true });
