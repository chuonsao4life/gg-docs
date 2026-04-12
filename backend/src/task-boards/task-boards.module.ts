import { Module } from '@nestjs/common';
import { TaskBoardsService } from './task-boards.service';
import { TaskBoardsController } from './task-boards.controller';

@Module({
  controllers: [TaskBoardsController],
  providers: [TaskBoardsService],
})
export class TaskBoardsModule {}
