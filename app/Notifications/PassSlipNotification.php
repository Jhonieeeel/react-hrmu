<?php

namespace App\Notifications;

use App\Models\PassSlip;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells a named signatory that a pass slip is waiting on them.
 */
class PassSlipNotification extends Notification
{
    use Queueable;

    public function __construct(public PassSlip $passSlip) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $slip = $this->passSlip;

        return (new MailMessage)
            ->subject('Pass slip awaiting your approval')
            ->line(sprintf(
                '%s filed a %s pass slip to %s on %s.',
                $slip->printed_name ?: 'A personnel',
                $slip->request_type,
                $slip->destination,
                $slip->date_requested?->toFormattedDateString() ?? 'an unscheduled date',
            ))
            ->line('Purpose: '.$slip->purpose)
            ->action('Review pass slip', route('slip-reviews.index'))
            ->line('Thank you for using our application!');
    }

    /**
     * The database payload behind the in-app notification list.
     *
     * Deliberately hand-built rather than `$this->passSlip->toArray()`: the
     * model serialises every column including both signatory foreign keys, none
     * of which the notification list renders.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'pass_slip_id' => $this->passSlip->id,
            'title' => 'Pass slip awaiting approval',
            'printed_name' => $this->passSlip->printed_name,
            'request_type' => $this->passSlip->request_type,
            'destination' => $this->passSlip->destination,
        ];
    }
}
