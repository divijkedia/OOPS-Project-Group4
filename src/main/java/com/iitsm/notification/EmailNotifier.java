package com.iitsm.notification;

import com.iitsm.domain.enums.NotificationChannel;
import com.iitsm.domain.model.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Adapter Pattern: Adapts external email transmission system.
 * Simulates enterprise SMTP dispatch with formatted headers and payload logging.
 */
@Component
public class EmailNotifier implements Notifier {

    private static final Logger log = LoggerFactory.getLogger(EmailNotifier.class);

    @Override
    public NotificationChannel getChannel() {
        return NotificationChannel.EMAIL;
    }

    @Override
    public void send(Notification notification) {
        log.info("""
                [SIMULATED EMAIL DISPATCH]
                To: User#{}
                Subject: [Resolvo Alert] {}
                Body:
                {}
                Incident Reference: INC-{}
                --------------------------------------------------""",
                notification.getRecipientId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getIncidentId());
    }
}
