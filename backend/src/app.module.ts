import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { DocumentsModule } from './documents/documents.module';
import { TaskBoardsModule } from './task-boards/task-boards.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    WorkspacesModule,
    DocumentsModule,
    TaskBoardsModule,
    TasksModule,
    ChatModule,
    NotificationsModule,
    ActivityLogsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
