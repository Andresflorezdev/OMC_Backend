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

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true, enum: Object.values(LeadSource) })
  source!: LeadSource;

  @Prop({ required: true })
  productInterest!: string;

  @Prop({ type: Number, required: true })
  budget!: number;

  @Prop({ required: true, default: null })
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
