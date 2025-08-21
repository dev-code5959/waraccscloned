<?php
// File: app/Mail/ManualDeliveryComplete.php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class ManualDeliveryComplete extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;
    public $deliveryFiles;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, array $deliveryFiles = [])
    {
        $this->order = $order;
        $this->deliveryFiles = $deliveryFiles;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Order #{$this->order->order_number} is Ready - Digital Products Delivered",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.manual-delivery-complete',
            text: 'emails.manual-delivery-complete-text',
            with: [
                'order' => $this->order,
                'customerName' => $this->order->user->name,
                'productName' => $this->order->product->name,
                'orderNumber' => $this->order->order_number,
                'quantity' => $this->order->quantity,
                'totalAmount' => $this->order->formatted_net_amount,
                'hasAttachments' => count($this->deliveryFiles) > 0,
                'fileCount' => count($this->deliveryFiles),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        $attachments = [];

        foreach ($this->deliveryFiles as $file) {
            $attachments[] = Attachment::fromPath($file['path'])
                ->as($file['name'])
                ->withMime($file['mime_type']);
        }

        return $attachments;
    }
}
