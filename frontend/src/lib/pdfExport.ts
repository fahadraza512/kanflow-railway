import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Workspace, 
  getProjects, 
  getBoards, 
  getTasks,
  getComments,
  getActivityLogs
} from "./storage";

export function exportWorkspaceToPDF(workspace: Workspace) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Workspace Export Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Export date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Export Date: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Workspace Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Workspace Information", 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${workspace.name}`, 14, yPosition);
  yPosition += 6;
  
  if (workspace.description) {
    doc.text(`Description: ${workspace.description}`, 14, yPosition);
    yPosition += 6;
  }
  
  doc.text(`Plan: ${workspace.plan.toUpperCase()}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Created: ${new Date(workspace.createdAt).toLocaleDateString()}`, 14, yPosition);
  yPosition += 12;

  // Get all data
  const projects = getProjects().filter(p => p.workspaceId === workspace.id);
  const boards = getBoards().filter(b => b.workspaceId === workspace.id);
  const tasks = getTasks().filter(t => t.workspaceId === workspace.id);
  const comments = getComments();
  const activityLogs = getActivityLogs().filter(log => log.workspaceId === workspace.id);

  // Summary Statistics
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary Statistics", 14, yPosition);
  yPosition += 8;

  const stats = [
    ["Projects", projects.length.toString()],
    ["Boards", boards.length.toString()],
    ["Tasks", tasks.length.toString()],
    ["Comments", comments.length.toString()],
    ["Activity Logs", activityLogs.length.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Count"]],
    body: stats,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Projects Table
  if (projects.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Projects", 14, yPosition);
    yPosition += 8;

    const projectData = projects.map(p => [
      p.name,
      p.description || "N/A",
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Name", "Description", "Created"]],
      body: projectData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Boards Table
  if (boards.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Boards", 14, yPosition);
    yPosition += 8;

    const boardData = boards.map(b => [
      b.name,
      projects.find(p => p.id === b.projectId)?.name || "Unknown",
      new Date(b.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Board Name", "Project", "Created"]],
      body: boardData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Tasks Table
  if (tasks.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Tasks", 14, yPosition);
    yPosition += 8;

    const taskData = tasks.map(t => [
      t.title,
      t.status || "N/A",
      t.priority || "N/A",
      t.assignedTo || "Unassigned",
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Title", "Status", "Priority", "Assigned To", "Due Date"]],
      body: taskData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Comments Table
  if (comments.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Comments", 14, yPosition);
    yPosition += 8;

    const commentData = comments.slice(0, 50).map(c => [
      c.userName || "Unknown",
      c.text.substring(0, 50) + (c.text.length > 50 ? "..." : ""),
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["User", "Comment", "Date"]],
      body: commentData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
      styles: { fontSize: 8 },
    });
  }

  // Save the PDF
  const fileName = `${workspace.name.replace(/[^a-z0-9]/gi, '_')}_export_${Date.now()}.pdf`;
  doc.save(fileName);
}
