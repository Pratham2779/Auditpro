function generateReportId() {
  const auditDate = new Date();

  if (isNaN(auditDate)) {
    console.error('generateReportId received invalid date:', auditLogDate);
    throw new Error('Invalid audit date passed to generateReportId');
  }

  const now = new Date();
  const formattedAuditDate = auditDate.toISOString().split('T')[0].replace(/-/g, '');
  const formattedCurrentDate = now.toISOString().split('T')[0].replace(/-/g, '');
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `REPORT-${formattedAuditDate}-${formattedCurrentDate}-${randomCode}`;
}

export { generateReportId };
