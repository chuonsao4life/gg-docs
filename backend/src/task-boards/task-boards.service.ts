import { Injectable } from '@nestjs/common';
import { CreateTaskBoardDto } from './dto/create-task-board.dto';
import { UpdateTaskBoardDto } from './dto/update-task-board.dto';

@Injectable()
export class TaskBoardsService {
  create(createTaskBoardDto: CreateTaskBoardDto) {
    return 'This action adds a new taskBoard';
  }

  findAll() {
    return `This action returns all taskBoards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} taskBoard`;
  }

  update(id: number, updateTaskBoardDto: UpdateTaskBoardDto) {
    return `This action updates a #${id} taskBoard`;
  }

  remove(id: number) {
    return `This action removes a #${id} taskBoard`;
  }
}
