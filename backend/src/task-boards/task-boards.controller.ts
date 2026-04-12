import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskBoardsService } from './task-boards.service';
import { CreateTaskBoardDto } from './dto/create-task-board.dto';
import { UpdateTaskBoardDto } from './dto/update-task-board.dto';

@Controller('task-boards')
export class TaskBoardsController {
  constructor(private readonly taskBoardsService: TaskBoardsService) {}

  @Post()
  create(@Body() createTaskBoardDto: CreateTaskBoardDto) {
    return this.taskBoardsService.create(createTaskBoardDto);
  }

  @Get()
  findAll() {
    return this.taskBoardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskBoardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskBoardDto: UpdateTaskBoardDto) {
    return this.taskBoardsService.update(+id, updateTaskBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskBoardsService.remove(+id);
  }
}
