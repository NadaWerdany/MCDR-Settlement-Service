package com.mcdr.settlement.service;
import com.mcdr.settlement.model.*;
import com.mcdr.settlement.repo.NotificationRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
@Service
public class NotificationService {
 private final NotificationRepository repo;
 public NotificationService(NotificationRepository repo){this.repo=repo;}
 public void notifyOwner(SettlementRequest r,String type,String title,String message){
  Notification n=new Notification(); n.recipient=r.crn; n.type=type; n.title=title; n.message=message;
  n.relatedRequestId=r.id; n.createdAt=Instant.now(); repo.save(n);
 }
 public void notifyBackoffice(SettlementRequest r,String type,String title,String message){
  Notification n=new Notification(); n.recipient="backoffice"; n.type=type; n.title=title; n.message=message;
  n.relatedRequestId=r.id; n.createdAt=Instant.now(); repo.save(n);
 }
}
