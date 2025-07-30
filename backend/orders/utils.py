from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

def generate_order_receipt_pdf(order):
    """Generate PDF receipt for an order"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    # Title
    title = Paragraph("Order Receipt", title_style)
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Order information
    order_info = [
        ['Order ID:', str(order.id)],
        ['Customer:', order.user.full_name],
        ['Email:', order.user.email],
        ['Order Date:', order.created_at.strftime('%B %d, %Y at %I:%M %p')],
        ['Status:', order.get_status_display()],
        ['Payment Status:', order.get_payment_status_display()],
    ]
    
    order_table = Table(order_info, colWidths=[2*inch, 4*inch])
    order_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    elements.append(order_table)
    elements.append(Spacer(1, 20))
    
    # Shipping address
    shipping_title = Paragraph("Shipping Address:", styles['Heading2'])
    elements.append(shipping_title)
    shipping_addr = Paragraph(order.shipping_address, styles['Normal'])
    elements.append(shipping_addr)
    elements.append(Spacer(1, 20))
    
    # Order items
    items_title = Paragraph("Order Items:", styles['Heading2'])
    elements.append(items_title)
    
    # Items table
    item_data = [['Product', 'Quantity', 'Price', 'Total']]
    
    for item in order.items.all():
        item_data.append([
            item.product.name,
            str(item.quantity),
            f'${item.price:.2f}',
            f'${item.total_price:.2f}'
        ])
    
    # Add total row
    item_data.append(['', '', 'Total Amount:', f'${order.total_amount:.2f}'])
    
    items_table = Table(item_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(items_table)
    elements.append(Spacer(1, 30))
    
    # Footer
    footer = Paragraph("Thank you for your business!", styles['Normal'])
    elements.append(footer)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return buffer