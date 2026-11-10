package com.iitsm.notification;

import com.iitsm.domain.enums.NotificationChannel;
import com.iitsm.domain.model.Notification;

/**
 * Adapter Pattern / Abstraction: Interface for external and internal notification channels.
 * Encapsulates communication mechanisms (Email, In-App, SMS) behind a uniform contract.
 */
public interface Notifier {

    /**
     * Identifies the delivery channel this notifier adapts.
     */
    NotificationChannel getChannel();

    /**
     * Transmits the notification payload through the underlying channel.
     *
     * @param notification the notification entity/payload to deliver
     */
    void send(Notification notification);
}
