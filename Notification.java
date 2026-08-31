package com.mcdr.settlement.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
public class Notification {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false) public String recipient;
 @Column(nullable=false) public String type;
 @Column(nullable=false) public String title;
 @Column(nullable=false,length=2000) public String message;
 public Long relatedRequestId;
 @Column(nullable=false) public Instant createdAt;
 public Instant readAt;
 public boolean isRead=false;
}
