import {
  Controller, Inject, Get,
  UseGuards, Param,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, map, Observable } from 'rxjs';
import {
  PublicUser, PublicWorkspaceWithParticipants, PublicQuestion,
  PublicWorkspace,
} from '@codern/external';
import { WorkspaceService } from '@/services/WorkspaceService';
import { User } from '@/utils/decorators/AuthDecorator';
import { AuthGuard } from '@/utils/guards/AuthGuard';
import { WorkspaceGuard } from '@/utils/guards/WorkspaceGuard';
import { AuthService } from '@/services/AuthService';
import { getParticipantsFromWorkspaces, publicQuestions, workspaceWithParticipants } from '@/utils/Serializer';
import { GradingService } from '@/services/GradingService';

@Controller('/workspaces')
export class WorkspaceController {

  private readonly workspaceService: WorkspaceService;
  private readonly authService: AuthService;
  private readonly gradingService: GradingService;

  public constructor(
    @Inject('WORKSPACE_PACKAGE') workspaceClient: ClientGrpc,
    @Inject('AUTH_PACKAGE') authClient: ClientGrpc,
    @Inject('GRADING_PACKAGE') gradingClient: ClientGrpc,
  ) {
    this.workspaceService = workspaceClient.getService('WorkspaceService');
    this.authService = authClient.getService('AuthService');
    this.gradingService = gradingClient.getService('GradingService');
  }

  @Get('/')
  @UseGuards(AuthGuard)
  public async getAllWorkspacesByUserId(
    @User() userData: PublicUser,
  ): Promise<PublicWorkspaceWithParticipants[]> {
    const userId = userData.id;
    const { workspaces } = await firstValueFrom(
      this.workspaceService.getAllWorkspacesByUserId({ userId }),
    );
    const participantIds = getParticipantsFromWorkspaces(workspaces);
    const { users } = await firstValueFrom(
      this.authService.getUserByIds({ userIds: participantIds }),
    );
    return workspaceWithParticipants(workspaces, users);
  }

  @Get('/:workspaceId')
  @UseGuards(AuthGuard, WorkspaceGuard)
  public getWorkspaceById(
    @Param('workspaceId') workspaceId: number,
  ): Observable<PublicWorkspace> {
    return this.workspaceService
      .getWorkspaceById({ workspaceId })
      .pipe(map((response) => response.workspace));
  }

  @Get('/:workspaceId/questions')
  @UseGuards(AuthGuard, WorkspaceGuard)
  public async getQuestionsByWorkspaceId(
    @Param('workspaceId') id: number,
  ): Promise<PublicQuestion[]> {
    const { questions } = await firstValueFrom(
      this.workspaceService.getQuestionsByWorkspaceId({ id }),
    );
    const questionIds = questions.map((question) => question.id);
    const { questionSummaries } = await firstValueFrom(
      this.gradingService.getQuestionSummaryByIds({ questionIds }),
    );
    return publicQuestions(questions, questionSummaries);
  }

  @Get('/:workspaceId/questions/:questionId')
  @UseGuards(AuthGuard, WorkspaceGuard)
  public async getQuestionById(
    @Param('questionId') id: number,
  ): Promise<PublicQuestion> {
    const { question } = await firstValueFrom(
      this.workspaceService.getQuestionById({ id }),
    );
    const { questionSummaries } = await firstValueFrom(
      this.gradingService.getQuestionSummaryByIds({ questionIds: [question.id] }),
    );
    return publicQuestions([question], questionSummaries)[0];
  }

}
