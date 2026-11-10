package com.iitsm.domain.factory;

import com.iitsm.domain.enums.NotificationChannel;
import com.iitsm.notification.Notifier;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Factory Pattern: Resolves appropriate Notifier instances based on requested NotificationChannel.
 * Uses an EnumMap for O(1) channel lookup.
 */
@Component
public class NotifierFactory {

    private final Map<NotificationChannel, Notifier> notifiers = new EnumMap<>(NotificationChannel.class);

    public NotifierFactory(List<Notifier> notifierList) {
        for (Notifier notifier : notifierList) {
            this.notifiers.put(notifier.getChannel(), notifier);
        }
    }

    public Optional<Notifier> getNotifier(NotificationChannel channel) {
        return Optional.ofNullable(notifiers.get(channel));
    }

    public List<Notifier> getAllNotifiers() {
        return List.copyOf(notifiers.values());
    }
}
