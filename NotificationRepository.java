package com.mcdr.settlement.repo;
import com.mcdr.settlement.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface NotificationRepository extends JpaRepository<Notification,Long>{
 List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);
}
