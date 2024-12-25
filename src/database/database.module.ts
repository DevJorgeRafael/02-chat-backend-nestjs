import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
      })
    })
  ],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {

  
  async onModuleInit() {
    mongoose.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: (doct, ret) => {
        const { _id, password, __v, ...rest } = ret;
        rest.id = _id;
        return rest;
      }
    })
    
    mongoose.connection.on('connected', () => {
      console.log('>>> DB IS CONNECTED')
    });

    mongoose.connection.on('error', (err) => {
      console.error('Error in DB connection: ', err.message)
    });
  }
}
