import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from 'src/auth/decorators';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guards';
import { RoleCode } from 'src/enums';
import { IJwtPayload } from 'src/types';
import { CasesService } from './cases.service';
import {
  CreateCaseInput,
  CreateCaseNoteInput,
  CreateCaseSessionRequestInput,
  GetCaseMessagesQueryDto,
  GetCasesDocumentsQueryDto,
  GetCasesQueryDto,
  GetInternalNotesQueryDto,
  MarkCaseChatReadDto,
  UploadCaseDocumentInput,
} from './dto';
import { UpdatePracticeAreaInput } from './dto/update-practice-area.dto';

@ApiTags('Cases')
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get('categories')
  getPracticeAreas() {
    return this.casesService.getPracticeAreas();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getCases(@Query() query: GetCasesQueryDto, @CurrentUser() user: IJwtPayload) {
    return this.casesService.getUserCases({ userId: user.sub, query });
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat-unread')
  getCaseChatUnread(@CurrentUser() user: IJwtPayload) {
    return this.casesService.getCaseChatUnreadSummary({
      userId: user.sub,
      activeRole: user.activeRole as string | undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':caseId/messages')
  getCaseMessages(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query() query: GetCaseMessagesQueryDto
  ) {
    return this.casesService.getCaseMessagesPage({
      caseId,
      beforeMessageId: query.beforeMessageId,
      limit: query.limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getCaseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.casesService.getCaseById({ caseId: id });
  }

  @Get('/:caseId/notes')
  @UseGuards(JwtAuthGuard)
  getCaseNotes(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query() query: GetInternalNotesQueryDto
  ) {
    return this.casesService.getCaseNotes({ caseId, query });
  }

  @Get('/:caseId/documents')
  @UseGuards(JwtAuthGuard)
  getCaseDocuments(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query() query: GetCasesDocumentsQueryDto
  ) {
    return this.casesService.getCaseDocuments({ caseId, query });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.USER, RoleCode.ADMIN)
  @Post()
  createCase(@Body() body: CreateCaseInput, @CurrentUser() user: IJwtPayload) {
    return this.casesService.createCase({ userId: user.sub, dto: body });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.ADMIN)
  @Patch('/categories/:practiceAreaId')
  updatePracticeArea(
    @Param('practiceAreaId', ParseUUIDPipe) practiceAreaId: string,
    @Body() body: UpdatePracticeAreaInput
  ) {
    return this.casesService.updatePracticeArea({ practiceAreaId, body });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':caseId/read-chat')
  markCaseChatRead(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @CurrentUser() user: IJwtPayload,
    @Body() body: MarkCaseChatReadDto
  ) {
    return this.casesService.markCaseChatRead({
      caseId,
      userId: user.sub,
      activeRole: user.activeRole as string | undefined,
      isAdmin: user.isAdmin,
      body,
    });
  }

  @Post('/:caseId/notes')
  @UseGuards(JwtAuthGuard)
  createCaseNote(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: CreateCaseNoteInput
  ) {
    return this.casesService.createCaseNote({ caseId, body });
  }

  @Post('/:caseId/documents/upload')
  @UseGuards(JwtAuthGuard)
  uploadCaseDocument(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: UploadCaseDocumentInput
  ) {
    return this.casesService.uploadCaseDocument({ caseId, body });
  }

  @Post('/:caseId/session-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.USER)
  createCaseSessionRequest(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: CreateCaseSessionRequestInput
  ) {
    return this.casesService.createCaseSessionRequest({ caseId, body });
  }
}
