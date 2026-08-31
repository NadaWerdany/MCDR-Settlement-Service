package com.mcdr.settlement.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
@Entity
public class SettlementRequest {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false) public String crn;
 @Column(nullable=false) public BigDecimal capital;
 @Enumerated(EnumType.STRING) @Column(nullable=false) public RequestStatus status;
 @Column(nullable=false) public Instant createdAt;
 public String rejectionReason;
 public BigDecimal totalFee=BigDecimal.ZERO;
 @OneToMany(mappedBy="request", cascade=CascadeType.ALL, orphanRemoval=true, fetch=FetchType.LAZY)
 public List<Meeting> meetings=new ArrayList<>();
 public SettlementRequest(){}
 public SettlementRequest(String crn, BigDecimal capital, RequestStatus status){
  this.crn=crn; this.capital=capital; this.status=status; this.createdAt=Instant.now();
 }
}
