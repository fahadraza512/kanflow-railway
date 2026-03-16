import {
  Controller,
  Get,
  UseGuards,
  Param,
  Res,
  Header,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Response } from 'express';
import PDFDocument from 'pdfkit';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('workspace/:workspaceId')
  getWorkspaceAnalytics(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getWorkspaceAnalytics(workspaceId);
  }

  @Get('workspace/:workspaceId/export')
  async exportWorkspaceAnalytics(
    @Param('workspaceId') workspaceId: string,
    @Res() res: Response,
  ) {
    try {
      console.log('=== Export Analytics Started ===');
      console.log('Workspace ID:', workspaceId);
      
      const data = await this.analyticsService.getWorkspaceAnalytics(workspaceId);
      
      console.log('Analytics data received:', JSON.stringify(data, null, 2));
      
      // Get time range from query params (default to 30d)
      const timeRange = (res.req.query.timeRange as string) || '30d';
      const timeRangeLabel = {
        '7d': '7 Days',
        '30d': '30 Days',
        '90d': '90 Days'
      }[timeRange] || '30 Days';
      
      console.log('Time range:', timeRangeLabel);
      
      // Set headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.pdf"');
      
      // Create PDF document
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4',
        bufferPages: true
      });
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Check if data exists
      if (!data || !data.projects || !data.boards || !data.tasks) {
        console.error('Missing data in analytics response');
        doc.fontSize(14).font('Helvetica').text('Error: No analytics data available', { align: 'center' });
        doc.end();
        return;
      }
      
      // Helper function to draw a colored box
      const drawBox = (x: number, y: number, width: number, height: number, color: string) => {
        doc.rect(x, y, width, height).fill(color);
      };
      
      // Header with gradient-like effect
      drawBox(0, 0, doc.page.width, 120, '#2563eb');
      
      // Title
      doc.fillColor('#ffffff')
        .fontSize(32)
        .font('Helvetica-Bold')
        .text('Analytics Report', 50, 30, { align: 'center' });
      
      // Metadata
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor('#e0e7ff')
        .text(`Generated: ${new Date().toLocaleString()}`, 50, 70, { align: 'center' })
        .text(`Time Range: ${timeRangeLabel}`, 50, 88, { align: 'center' });
      
      // Reset position after header
      doc.y = 150;
      doc.fillColor('#000000');
      
      // Overview Section with colored background
      drawBox(50, doc.y - 10, doc.page.width - 100, 40, '#f3f4f6');
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('Overview', 60, doc.y, { continued: false });
      
      doc.moveDown(1.5);
      
      // Stats Cards
      const cardY = doc.y;
      const cardWidth = 150;
      const cardHeight = 80;
      const cardSpacing = 20;
      
      // Projects Card
      drawBox(50, cardY, cardWidth, cardHeight, '#dbeafe');
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('Projects', 60, cardY + 15);
      doc.fontSize(24)
        .fillColor('#1e3a8a')
        .text(`${data.projects?.total || 0}`, 60, cardY + 35);
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#3b82f6')
        .text(`${data.projects?.active || 0} Active`, 60, cardY + 60);
      
      // Boards Card
      drawBox(50 + cardWidth + cardSpacing, cardY, cardWidth, cardHeight, '#fef3c7');
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#92400e')
        .text('Boards', 60 + cardWidth + cardSpacing, cardY + 15);
      doc.fontSize(24)
        .fillColor('#78350f')
        .text(`${data.boards?.total || 0}`, 60 + cardWidth + cardSpacing, cardY + 35);
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#f59e0b')
        .text('Total Boards', 60 + cardWidth + cardSpacing, cardY + 60);
      
      // Tasks Card
      drawBox(50 + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, '#d1fae5');
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#065f46')
        .text('Tasks', 60 + (cardWidth + cardSpacing) * 2, cardY + 15);
      doc.fontSize(24)
        .fillColor('#064e3b')
        .text(`${data.tasks?.total || 0}`, 60 + (cardWidth + cardSpacing) * 2, cardY + 35);
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#10b981')
        .text(`${(data.tasks?.completionRate || 0).toFixed(0)}% Complete`, 60 + (cardWidth + cardSpacing) * 2, cardY + 60);
      
      doc.y = cardY + cardHeight + 30;
      
      // Task Status Breakdown
      drawBox(50, doc.y - 10, doc.page.width - 100, 40, '#f3f4f6');
      doc.fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('Task Status Breakdown', 60, doc.y, { continued: false });
      
      doc.moveDown(1.5);
      
      const statusY = doc.y;
      const statusItems = [
        { label: 'Completed', value: data.tasks?.completed || 0, color: '#10b981', bgColor: '#d1fae5' },
        { label: 'In Review', value: data.tasks?.inReview || 0, color: '#8b5cf6', bgColor: '#ede9fe' },
        { label: 'In Progress', value: data.tasks?.inProgress || 0, color: '#3b82f6', bgColor: '#dbeafe' },
        { label: 'To Do', value: data.tasks?.todo || 0, color: '#6b7280', bgColor: '#f3f4f6' },
        { label: 'Overdue', value: data.tasks?.overdue || 0, color: '#ef4444', bgColor: '#fee2e2' }
      ];
      
      statusItems.forEach((item, index) => {
        const itemY = statusY + (index * 35);
        drawBox(60, itemY, 400, 28, item.bgColor);
        doc.fontSize(11)
          .font('Helvetica-Bold')
          .fillColor(item.color)
          .text(item.label, 70, itemY + 8);
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor(item.color)
          .text(`${item.value}`, 450, itemY + 6, { width: 80, align: 'right' });
      });
      
      doc.y = statusY + (statusItems.length * 35) + 20;
      
      // Priority Distribution
      if (data.tasks?.byPriority && data.tasks.byPriority.length > 0) {
        drawBox(50, doc.y - 10, doc.page.width - 100, 40, '#f3f4f6');
        doc.fontSize(18)
          .font('Helvetica-Bold')
          .fillColor('#1f2937')
          .text('Priority Distribution', 60, doc.y, { continued: false });
        
        doc.moveDown(1.5);
        
        const priorityColors = {
          urgent: { color: '#dc2626', bgColor: '#fee2e2' },
          high: { color: '#ea580c', bgColor: '#ffedd5' },
          medium: { color: '#f59e0b', bgColor: '#fef3c7' },
          low: { color: '#10b981', bgColor: '#d1fae5' }
        };
        
        data.tasks.byPriority.forEach((p, index) => {
          const itemY = doc.y + (index * 30);
          const priority = p.priority?.toLowerCase() || 'low';
          const colors = priorityColors[priority] || priorityColors.low;
          
          drawBox(60, itemY, 350, 24, colors.bgColor);
          doc.fontSize(11)
            .font('Helvetica')
            .fillColor(colors.color)
            .text(`${p.priority || 'Unknown'}`, 70, itemY + 6);
          doc.fontSize(12)
            .font('Helvetica-Bold')
            .fillColor(colors.color)
            .text(`${p.count || 0} tasks`, 400, itemY + 5, { width: 80, align: 'right' });
        });
        
        doc.y += data.tasks.byPriority.length * 30 + 20;
      }
      
      // Project Statistics
      if (data.projectStats && data.projectStats.length > 0) {
        // Add new page if needed
        if (doc.y > 650) {
          doc.addPage();
        }
        
        drawBox(50, doc.y - 10, doc.page.width - 100, 40, '#f3f4f6');
        doc.fontSize(18)
          .font('Helvetica-Bold')
          .fillColor('#1f2937')
          .text('Project Statistics', 60, doc.y, { continued: false });
        
        doc.moveDown(1.5);
        
        data.projectStats.forEach((p, index) => {
          if (doc.y > 700) {
            doc.addPage();
            doc.y = 50;
          }
          
          const projectY = doc.y;
          drawBox(60, projectY, 480, 60, '#fafafa');
          
          doc.fontSize(13)
            .font('Helvetica-Bold')
            .fillColor('#1f2937')
            .text(p.name || 'Unnamed Project', 70, projectY + 10);
          
          doc.fontSize(10)
            .font('Helvetica')
            .fillColor('#6b7280')
            .text(`Total: ${p.totalTasks || 0} tasks`, 70, projectY + 30)
            .text(`Completed: ${p.completedTasks || 0}`, 200, projectY + 30)
            .text(`Rate: ${(p.completionRate || 0).toFixed(1)}%`, 350, projectY + 30);
          
          // Progress bar
          const barWidth = 400;
          const barHeight = 8;
          const barX = 70;
          const barY = projectY + 48;
          
          drawBox(barX, barY, barWidth, barHeight, '#e5e7eb');
          const progressWidth = (barWidth * (p.completionRate || 0)) / 100;
          drawBox(barX, barY, progressWidth, barHeight, '#10b981');
          
          doc.y = projectY + 70;
        });
      }
      
      // Footer
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text('Generated by KanbanFlow Analytics', 50, doc.page.height - 50, { 
          align: 'center',
          width: doc.page.width - 100
        });
      
      console.log('PDF generation completed');
      
      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate PDF', 
        message: error.message,
        stack: error.stack 
      });
    }
  }

  @Get('project/:projectId')
  getProjectAnalytics(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectAnalytics(projectId);
  }

  @Get('user/:userId')
  getUserAnalytics(@Param('userId') userId: string) {
    return this.analyticsService.getUserAnalytics(userId);
  }

  @Get('user/me')
  getMyAnalytics(@CurrentUser() user: any) {
    return this.analyticsService.getUserAnalytics(user.userId);
  }

  @Get('tasks')
  getTaskStatistics() {
    return this.analyticsService.getTaskStatistics();
  }
}
