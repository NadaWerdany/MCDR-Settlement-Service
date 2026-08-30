package com.mcdr.settlement.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
public class SettlementDocument {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @OneToOne(fetch=FetchType.LAZY, optional=false) public Meeting meeting;
 @Column(nullable=false) public String originalFilename;
 @Column(nullable=false) public String contentType;
 @Column(nullable=false) public long size;
 @Column(nullable=false) public String storageKey;
 @Column(nullable=false) public String uploadedBy;
 @Column(nullable=false) public Instant uploadedAt;
}
