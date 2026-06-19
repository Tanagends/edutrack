const nodemailer = require('nodemailer');

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/**
 * Send an academic risk alert email
 * @param {Object} entry - { student, course, attendancePercent?, gradeDrop?, reason }
 */
const sendRiskAlert = async (entry) => {
  const transporter = getTransporter();

  const studentName = entry.student?.user?.name || 'Student';
  const studentEmail = entry.student?.user?.email || '';
  const guardianEmail = entry.student?.guardianEmail || '';
  const courseName = entry.course?.name || 'Unknown Course';
  const courseCode = entry.course?.code || '';

  let subject = '';
  let body = '';

  if (entry.reason === 'low_attendance') {
    subject = `[EduTrack Alert] Low Attendance — ${studentName} in ${courseCode}`;
    body = `
      <h2 style="color:#e85d04">Academic Risk Alert — Low Attendance</h2>
      <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
      <p><strong>Course:</strong> ${courseName} (${courseCode})</p>
      <p><strong>Attendance:</strong> ${entry.attendancePercent}% (below 75% threshold)</p>
      <p>Immediate intervention is recommended. Please follow up with the student.</p>
      <hr/>
      <small>Sent by EduTrack — Aditya University</small>
    `;
  } else if (entry.reason === 'low_grade') {
    subject = `[EduTrack Alert] Low Grade — ${studentName} in ${courseCode}`;
    body = `
      <h2 style="color:#e85d04">Academic Risk Alert — Low Grade</h2>
      <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
      <p><strong>Course:</strong> ${courseName} (${courseCode})</p>
      <p><strong>Current Grade:</strong> ${entry.letterGrade} (${entry.currentScore}/100)</p>
      <p>Please review recent assessment results and follow up with the student.</p>
      <hr/>
      <small>Sent by EduTrack — Aditya University</small>
    `;
  }

  const recipients = [studentEmail];
  if (guardianEmail) recipients.push(guardianEmail);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients.join(', '),
    subject,
    html: body,
  });
};

module.exports = { sendRiskAlert };
