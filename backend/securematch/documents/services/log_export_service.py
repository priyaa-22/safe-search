import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_auditor_logs_pdf(auditor, logs):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        name="LogsTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8,
    )
    subtitle_style = ParagraphStyle(
        name="LogsSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=14,
    )
    body_style = ParagraphStyle(
        name="LogsBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#334155"),
    )

    story = [
        Paragraph("SecureMatch Auditor Search Logs", title_style),
        Paragraph(
            f"Auditor: {auditor.name} | Auditor ID: {auditor.id} | Key Version: {auditor.key_version}",
            subtitle_style,
        ),
    ]

    table_data = [[
        Paragraph("<b>Timestamp</b>", body_style),
        Paragraph("<b>Status</b>", body_style),
        Paragraph("<b>Matches</b>", body_style),
        Paragraph("<b>Returned</b>", body_style),
        Paragraph("<b>Latency</b>", body_style),
        Paragraph("<b>Key Ver</b>", body_style),
        Paragraph("<b>Keyword Hash</b>", body_style),
    ]]

    for log in logs:
        created_at = log.created_at.strftime("%Y-%m-%d %H:%M:%S")
        status = "SUCCESS" if log.success else "FAILED"
        keyword_hash = log.keyword_hash or "-"

        table_data.append([
            Paragraph(created_at, body_style),
            Paragraph(status, body_style),
            Paragraph(str(log.total_matches), body_style),
            Paragraph(str(log.returned_count), body_style),
            Paragraph(f"{round(log.execution_time_ms or 0, 2)} ms", body_style),
            Paragraph(str(getattr(log, "key_version", 1)), body_style),
            Paragraph(keyword_hash, body_style),
        ])

    if len(table_data) == 1:
        table_data.append([
            Paragraph("No logs found", body_style),
            Paragraph("-", body_style),
            Paragraph("-", body_style),
            Paragraph("-", body_style),
            Paragraph("-", body_style),
            Paragraph("-", body_style),
            Paragraph("-", body_style),
        ])

    logs_table = Table(
        table_data,
        colWidths=[78, 45, 42, 46, 52, 38, 170],
        repeatRows=1,
    )
    logs_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))

    story.append(Spacer(1, 8))
    story.append(logs_table)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
