from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Order

@shared_task
def send_order_confirmation_email(order_id):
    """Send order confirmation email"""
    try:
        order = Order.objects.get(id=order_id)
        
        subject = f'Order Confirmation - Order #{order.id}'
        message = f'''
        Dear {order.user.first_name},
        
        Thank you for your order! Your order #{order.id} has been placed successfully.
        
        Order Details:
        - Total Amount: ${order.total_amount}
        - Status: {order.get_status_display()}
        - Shipping Address: {order.shipping_address}
        
        We'll notify you when your order is shipped.
        
        Best regards,
        E-commerce Team
        '''
        
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [order.user.email],
            fail_silently=False,
        )
        
        return f"Email sent successfully for order {order_id}"
    except Order.DoesNotExist:
        return f"Order {order_id} not found"
    except Exception as e:
        return f"Failed to send email for order {order_id}: {str(e)}"