package com.iitsm.notification;

import com.iitsm.domain.enums.NotificationChannel;
import com.iitsm.domain.model.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Adapter Pattern: Adapts internal in-app notifications.
 * Prepares and delivers alerts to the user's active session and persistent feed.
 */
@Component
public class InAppNotifier implements Notifier {

    private static final Logger log = LoggerFactory.getLogger(InAppNotifier.class);

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.IN_APP;
    }

    @Override
    public void send(Notification notification) {
        log.info("[IN-APP NOTIFICATION] Recipient: {}, Title: '{}', Message: '{}' (Incident: {})",
                notification.getRecipientId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getIncidentId());
    }
}
