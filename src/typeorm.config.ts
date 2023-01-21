import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import configuration from './configuration';

export const TypeormConfiguration: MongoConnectionOptions = {
  url: configuration().DatabaseUrl,
  database: configuration().Database || 'HMSTAN',
  type: 'mongodb',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
