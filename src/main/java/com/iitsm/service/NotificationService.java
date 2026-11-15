package com.iitsm.service;

import com.iitsm.domain.enums.NotificationChannel;
import com.iitsm.domain.model.Notification;
import com.iitsm.domain.factory.NotifierFactory;
import com.iitsm.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service orchestrating user notification storage, delivery through channel notifiers,
 * and read receipts.
 */
@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotifierFactory notifierFactory;

    public NotificationService(NotificationRepository notificationRepository,
                               NotifierFactory notifierFactory) {
        this.notificationRepository = notificationRepository;
        this.notifierFactory = notifierFactory;
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public Notification notifyUser(Long recipientId, String type, String title,
                                   String message, NotificationChannel channel, Long incidentId) {
        Notification notification = new Notification(recipientId, type, title, message, channel, incidentId);
        Notification saved = notificationRepository.save(notification);

        // Dispatch through channel adapter
        notifierFactory.getNotifier(channel).ifPresent(n -> n.send(saved));

        return saved;
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(Notification::markAsRead);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalse(userId);
        unread.forEach(Notification::markAsRead);
    }
}
