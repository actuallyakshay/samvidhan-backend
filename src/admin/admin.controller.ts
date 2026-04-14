import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { CurrentUser } from 'src/auth/decorators';
import { ChangePasswordInput } from 'src/auth/dto/auth.dto';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';
import {
  GetCaseMessagesQueryDto,
  GetCasesDocumentsQueryDto,
  GetCasesQueryDto,
  GetInternalNotesQueryDto,
  MarkCaseChatReadDto,
} from 'src/cases/dto';
import {
  CaseSessionRequestRaisedBy,
  CaseSessionRequestStatus,
} from 'src/data/entities/case-session-request.entity';
import { CaseStatus, RoleCode, UserRoleStatus } from 'src/enums';
import { UpdateLawyerInput } from 'src/lawyers/dto/update-lawyer.dto';
import { IJwtPayload } from 'src/types';
import { UpdateUserInput } from 'src/users/dto';
import { AdminService } from './admin.service';
import {
  CreateUserInput,
  GetCasesAdminQueryDto,
  GetLawyersAdminQueryDto,
  GetUsersQueryDto,
} from './dto';
import { AddLawyerInput } from './dto/add-lawyer.dto';
import { UpdateSettingsInput } from './dto/admin-settings.dto';
import { GetCaseSessionRequestsQueryDto } from './dto/session-requests.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService
  ) {}

  @Get('/cases/session-requests')
  getCaseSessionRequests(@Query() query: GetCaseSessionRequestsQueryDto) {
    return this.adminService.getCaseSessionRequests({ query });
  }

  @Get('lawyers/:lawyerId/cases')
  getLawyerCases(@Param('lawyerId') lawyerId: string, @Query() query: GetCasesQueryDto) {
    return this.adminService.getLawyerCases({ lawyerId, query });
  }

  @Get('users/:userId/cases')
  getUsersCases(@Param('userId') userId: string, @Query() query: GetCasesQueryDto) {
    return this.adminService.getUsersCases({ userId, query });
  }

  @Get('users/:userId')
  getUserById(@Param('userId') userId: string) {
    return this.adminService.getUserById({ userId });
  }

  @Get('lawyers/:lawyerId')
  getLawyerById(@Param('lawyerId') lawyerId: string) {
    return this.adminService.getLawyerById({ lawyerId });
  }

  @Get('cases/chat-unread')
  getAdminCaseChatUnread(@CurrentUser() user: IJwtPayload) {
    return this.adminService.getCaseChatUnreadSummary({ userId: user.sub });
  }

  @Get('cases/:caseId')
  getCaseById(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.adminService.getCaseById({ caseId });
  }

  @Get('cases/:caseId/messages')
  getCaseMessages(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query() query: GetCaseMessagesQueryDto
  ) {
    return this.adminService.getCaseMessages({ caseId, query });
  }

  @Post('cases/:caseId/read-chat')
  markAdminCaseChatRead(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @CurrentUser() user: IJwtPayload,
    @Body() body: MarkCaseChatReadDto
  ) {
    return this.adminService.markCaseChatRead({
      caseId,
      userId: user.sub,
      body,
    });
  }

  @Get('/cases/:caseId/notes')
  getCaseNotes(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query() query: GetInternalNotesQueryDto
  ) {
    return this.adminService.getCaseNotes({ caseId, query });
  }

  @Get('/cases/:caseId/documents')
  getCaseDocuments(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query() query: GetCasesDocumentsQueryDto
  ) {
    return this.adminService.getCaseDocuments({ caseId, query });
  }

  @Get('users')
  getUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getUsers({ query });
  }

  @Get('lawyers')
  getLawyers(@Query() query: GetLawyersAdminQueryDto) {
    return this.adminService.getLawyers({ query });
  }

  @Get('cases')
  getCases(@Query() query: GetCasesAdminQueryDto) {
    return this.adminService.getCases({ query });
  }

  @Get('settings')
  getAdminSettings() {
    return this.adminService.getAdminSettings();
  }

  @Patch('users/:userId/roles/:roleCode')
  toggleUserRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleCode', new ParseEnumPipe(RoleCode)) roleCode: RoleCode,
    @Body() body: { status: UserRoleStatus }
  ) {
    return this.adminService.toggleUserRole({ userId, roleCode, status: body.status });
  }

  @Patch('lawyers/:userId/toggle')
  toggleLawyerProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.adminService.toggleLawyerProfile({ userId });
  }

  @Patch('users/:userId/suspend')
  suspendAccount(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.adminService.suspendAccount({ userId });
  }

  @Post('lawyers')
  addLawyer(@Body() body: AddLawyerInput) {
    return this.adminService.addLawyer({ body });
  }

  @Post('/cases/:caseId/notes')
  createCaseNote(@Param('caseId', ParseUUIDPipe) caseId: string, @Body() body: { note: string }) {
    return this.adminService.createCaseNote({
      caseId,
      body: { note: body.note, author: CaseSessionRequestRaisedBy.ADMIN },
    });
  }

  @Patch('lawyers/:lawyerId/update')
  updateLawyerProfile(
    @Param('lawyerId', ParseUUIDPipe) lawyerId: string,
    @Body() body: UpdateLawyerInput
  ) {
    return this.adminService.updateLawyerProfile({ lawyerId, body });
  }

  @Patch('users/:userId/update')
  updateUserProfile(@Param('userId', ParseUUIDPipe) userId: string, @Body() body: UpdateUserInput) {
    return this.adminService.updateUserProfile({ userId, body });
  }

  @Get('analytics')
  getAdminAnalytics() {
    return this.adminService.getAdminAnalytics();
  }

  @Patch('reset-password')
  resetPassword(@Body() body: ChangePasswordInput, @CurrentUser() user: IJwtPayload) {
    return this.authService.changePassword({ userId: user.sub, body });
  }

  @Patch('cases/:caseId/assign-lawyer')
  assignLawyerToCase(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: { lawyerId: string }
  ) {
    return this.adminService.assignLawyerToCase({ caseId, lawyerId: body.lawyerId });
  }

  @Patch('cases/:caseId/reset-case')
  resetCase(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.adminService.resetCase({ caseId });
  }

  @Patch('cases/:caseId/update-status')
  updateCaseStatus(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() body: { status: CaseStatus }
  ) {
    return this.adminService.updateCaseStatus({ caseId, status: body.status });
  }

  @Patch('/cases/session-requests/:sessionRequestId/update-status')
  updateCaseSessionRequest(
    @Param('sessionRequestId', ParseUUIDPipe) sessionRequestId: string,
    @Body() body: { status: CaseSessionRequestStatus }
  ) {
    return this.adminService.updateCaseSessionRequest({ sessionRequestId, status: body.status });
  }

  @Post('/users/create')
  createUser(@Body() body: CreateUserInput) {
    return this.adminService.createUser({ body });
  }

  @Patch('/settings')
  updateAdminSettings(@Body() body: UpdateSettingsInput) {
    return this.adminService.updateAdminSettings({ body });
  }
}
