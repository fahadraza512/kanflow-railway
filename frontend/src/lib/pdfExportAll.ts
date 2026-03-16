import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  getWorkspaces,
  getProjects, 
  getBoards, 
  getTasks,
  getComments,
  getActivityLogs
} from "./storage";

export function exportAllDataToPDF(userName: string, userEmail: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Complete Data Export", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // User info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`User: ${userName} (${userEmail})`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  doc.text(`Export Date: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Get all data
  const workspaces = getWorkspaces();
  const allProjects = getProjects();
  const allBoards = getBoards();
  const allTasks = getTasks();
  const allComments = getComments();
  const allActivityLogs = getActivityLogs();

  // Overall Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Summary", 14, yPosition);
  yPosition += 8;

  const overallStats = [
    ["Total Workspaces", workspaces.length.toString()],
    ["Total Projects", allProjects.length.toString()],
    ["Total Boards", allBoards.length.toString()],
    ["Total Tasks", allTasks.length.toString()],
    ["Total Comments", allComments.length.toString()],
    ["Total Activity Logs", allActivityLogs.length.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Count"]],
    body: overallStats,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Workspaces Details
  if (workspaces.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("All Workspaces", 14, yPosition);
    yPosition += 8;

    const workspaceData = workspaces.map(w => [
      w.name,
      w.plan.toUpperCase(),
      new Date(w.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Workspace Name", "Plan", "Created"]],
      body: workspaceData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Loop through each workspace
  workspaces.forEach((workspace, index) => {
    const projects = allProjects.filter(p => p.workspaceId === workspace.id);
    const boards = allBoards.filter(b => b.workspaceId === workspace.id);
    const tasks = allTasks.filter(t => t.workspaceId === workspace.id);
    const activityLogs = allActivityLogs.filter(log => log.workspaceId === workspace.id);

    // New page for each workspace
    if (index > 0 || yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Workspace Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Workspace: ${workspace.name}`, 14, yPosition);
    yPosition += 10;

    // Workspace Stats
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Plan: ${workspace.plan.toUpperCase()}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Created: ${new Date(workspace.createdAt).toLocaleDateString()}`, 14, yPosition);
    yPosition += 5;
    if (workspace.description) {
      doc.text(`Description: ${workspace.description}`, 14, yPosition);
      yPosition += 5;
    }
    yPosition += 5;

    // Workspace Summary
    const wsStats = [
      ["Projects", projects.length.toString()],
      ["Boards", boards.length.toString()],
      ["Tasks", tasks.length.toString()],
      ["Activity Logs", activityLogs.length.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Count"]],
      body: wsStats,
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 14 },
      styles: { fontSize: 9 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Projects in this workspace
    if (projects.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Projects", 14, yPosition);
      yPosition += 6;

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
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 14 },
        styles: { fontSize: 8 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Boards in this workspace
    if (boards.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Boards", 14, yPosition);
      yPosition += 6;

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
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 14 },
        styles: { fontSize: 8 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Tasks in this workspace
    if (tasks.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Tasks", 14, yPosition);
      yPosition += 6;

      const taskData = tasks.slice(0, 100).map(t => [
        t.title.substring(0, 30) + (t.title.length > 30 ? "..." : ""),
        t.status || "N/A",
        t.priority || "N/A",
        t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Title", "Status", "Priority", "Due Date"]],
        body: taskData,
        theme: "striped",
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 14 },
        styles: { fontSize: 7 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;

      if (tasks.length > 100) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(`Showing first 100 of ${tasks.length} tasks`, 14, yPosition);
        yPosition += 5;
      }
    }
  });

  // Save the PDF
  const fileName = `KanbanFlow_Complete_Export_${Date.now()}.pdf`;
  doc.save(fileName);
}
