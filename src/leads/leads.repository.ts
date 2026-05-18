import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';
import { LeadSource } from './lead-source.enum';

@Injectable()
export class LeadsRepository {
  constructor(@InjectModel(Lead.name) private leadModel: Model<LeadDocument>) {}

  create(data: Partial<Lead>): Promise<LeadDocument> {
    return this.leadModel.create(data);
  }

  findById(id: string): Promise<Lead | null> {
    return this.leadModel
      .findOne({ _id: id, deletedAt: null })
      .lean<Lead>()
      .exec();
  }

  async findMany(options: {
    page: number;
    limit: number;
    fuente?: LeadSource;
    fechaInicio?: Date;
    fechaFin?: Date;
  }) {
    const { page, limit, fuente, fechaInicio, fechaFin } = options;

    const baseQuery: Record<string, unknown> = { deletedAt: null };
    if (fuente) baseQuery['source'] = fuente;
    if (fechaInicio || fechaFin) {
      const createdAtFilter: { $gte?: Date; $lte?: Date } = {};
      if (fechaInicio) createdAtFilter.$gte = fechaInicio;
      if (fechaFin) createdAtFilter.$lte = fechaFin;
      baseQuery['createdAt'] = createdAtFilter;
    }

    return this.leadModel
      .find(baseQuery as FilterQuery<LeadDocument>)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<Lead[]>()
      .exec();
  }

  update(id: string, data: Partial<Lead>): Promise<Lead | null> {
    return this.leadModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean<Lead>()
      .exec();
  }

  softDelete(id: string): Promise<Lead | null> {
    return this.leadModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .lean<Lead>()
      .exec();
  }

  totalActive(): Promise<number> {
    return this.leadModel.countDocuments({ deletedAt: null }).exec();
  }

  async countBySource() {
    const res = (await this.leadModel
      .aggregate()
      .match({ deletedAt: null })
      .group({ _id: '$source', count: { $sum: 1 } })) as Array<{
      _id: LeadSource;
      count: number;
    }>;

    return res.map((r) => ({ source: r._id, _count: { source: r.count } }));
  }

  async averageBudget() {
    const res = (await this.leadModel
      .aggregate()
      .match({ deletedAt: null })
      .group({ _id: null, avgBudget: { $avg: '$budget' } })) as Array<{
      _id: null;
      avgBudget: number | null;
    }>;

    return { _avg: { budget: res[0]?.avgBudget ?? null } };
  }

  countLast7Days() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.leadModel
      .countDocuments({
        deletedAt: null,
        createdAt: { $gte: sevenDaysAgo },
      })
      .exec();
  }
}
