import { 
  Model, 
  HydratedDocument, 
  RootFilterQuery, 
  ProjectionType, 
  UpdateQuery, 
  QueryOptions,
  UpdateWriteOpResult,
  DeleteResult
} from 'mongoose';

export abstract class DbRepository<TDocument> {
  constructor(protected readonly Model: Model<TDocument>) {}

  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.Model.create(data);
  }

  async findOne(
    filter: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument>
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.Model.findOne(filter, select);
  }

  async find(
    filter: RootFilterQuery<TDocument>,
    select?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>
  ): Promise<HydratedDocument<TDocument>[]> {
    return this.Model.find(filter, select, options);
  }

  async paginate({
    filter,
    query,
    select,
    options,
  }: {
    filter: RootFilterQuery<TDocument>,
    query: { page: number, limit: number },
    select?: ProjectionType<TDocument>,
    options?: QueryOptions<TDocument>
  }) {
    let { page, limit } = query;

    if (page < 1) page = 1;
    page = page * 1 || 1;

    const skip = (page - 1) * limit;
    const finalOptions = {
      ...options,
      skip,
      limit
    };

    const docs = await this.Model.find(filter, select, finalOptions);
    return { docs, currentPage: page };
  }

  async updateOne(
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<UpdateWriteOpResult> {
    return await this.Model.updateOne(filter, update);
  }

  async findOneAndUpdate(
    filter: RootFilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options: QueryOptions<TDocument> | null = null
  ): Promise<HydratedDocument<TDocument> | null> {
    return await this.Model.findOneAndUpdate(filter, update, options);
  }

  async deleteOne(
    filter: RootFilterQuery<TDocument>
  ): Promise<DeleteResult> {
    return await this.Model.deleteOne(filter);
  }
}
