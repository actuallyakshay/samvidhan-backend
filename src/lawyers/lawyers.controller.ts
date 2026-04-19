import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from 'src/auth/decorators';
import { JwtAuthGuard, RolesGuard } from 'src/auth/guards';
import { GetCasesQueryDto } from 'src/cases/dto';
import { RoleCode } from 'src/enums';
import { IJwtPayload } from 'src/types';
import { CreateLawyerDocumentDto, GetLawyersQueryDto } from './dto';
import { UpdateLawyerInput } from './dto/update-lawyer.dto';
import { LawyersService } from './lawyers.service';

@ApiTags('Lawyers')
@Controller('lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getLawyers(@Query() query: GetLawyersQueryDto) {
    return this.lawyersService.getLawyers({ query });
  }

  @Get('cases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAWYER)
  @ApiBearerAuth()
  getLawyerCases(@Query() query: GetCasesQueryDto, @CurrentUser() user: IJwtPayload) {
    return this.lawyersService.getLawyerCases({ userId: user.sub, query });
  }

  @Get('cases/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAWYER)
  @ApiBearerAuth()
  getLawyerCaseById(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @CurrentUser() user: IJwtPayload
  ) {
    return this.lawyersService.getLawyerCaseById({ userId: user.sub, caseId });
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAWYER)
  @ApiBearerAuth()
  getLawyerAnalytics(@CurrentUser() user: IJwtPayload) {
    return this.lawyersService.getLawyerAnalytics({ userId: user.sub });
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAWYER)
  @ApiBearerAuth()
  listLawyerDocuments(@CurrentUser() user: IJwtPayload) {
    return this.lawyersService.listLawyerDocumentsForUser({ userId: user.sub });
  }

  @Post('documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAWYER)
  @ApiBearerAuth()
  createLawyerDocument(@CurrentUser() user: IJwtPayload, @Body() body: CreateLawyerDocumentDto) {
    return this.lawyersService.createLawyerDocument({ userId: user.sub, dto: body });
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getLawyerById(@Param('id', ParseUUIDPipe) id: string) {
    return this.lawyersService.getLawyerById({ lawyerId: id });
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAWYER)
  @ApiBearerAuth()
  updateLawyer(@Body() body: UpdateLawyerInput, @CurrentUser() user: IJwtPayload) {
    return this.lawyersService.updateLawyerProfile({ userId: user.sub, body });
  }

  @Delete('/documents/:documentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.LAWYER)
  @ApiBearerAuth()
  deleteLawyerDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: IJwtPayload
  ) {
    return this.lawyersService.deleteLawyerDocument({
      documentId,
      userId: user.sub,
    });
  }
}
