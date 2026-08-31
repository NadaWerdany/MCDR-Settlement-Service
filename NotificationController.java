package com.mcdr.settlement.controller;
import com.mcdr.settlement.model.Notification;
import com.mcdr.settlement.repo.NotificationRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.security.Principal;
@RestController @RequestMapping("/api/notifications")
public class NotificationController {
 private final NotificationRepository repo;
 public NotificationController(NotificationRepository r){repo=r;}
 @GetMapping @PreAuthorize("hasAnyRole('OWNER','BACKOFFICE_EMPLOYEE')")
 public Object list(Principal p){return repo.findByRecipientOrderByCreatedAtDesc(p.getName().equals("backoffice@mcdr.local")?"backoffice":"OWNER_DEMO");}
}
