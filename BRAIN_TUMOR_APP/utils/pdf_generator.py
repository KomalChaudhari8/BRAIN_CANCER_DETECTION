from reportlab.platypus import SimpleDocTemplate, Paragraph, Image
from reportlab.lib.styles import getSampleStyleSheet

def generate_report(image_path, prediction, confidence, gradcam_path):
    pdf_path = "Brain_Tumor_Report.pdf"
    doc = SimpleDocTemplate(pdf_path)
    styles = getSampleStyleSheet()

    content = [
        Paragraph("<b>Brain Tumor Detection Report</b>", styles["Title"]),
        Paragraph(f"Prediction: {prediction}", styles["Normal"]),
        Paragraph(f"Confidence: {confidence:.2%}", styles["Normal"]),
        Image(image_path, width=200, height=200),
        Paragraph("Grad-CAM Explanation:", styles["Heading2"]),
        Image(gradcam_path, width=200, height=200)
    ]

    doc.build(content)
    return pdf_path
