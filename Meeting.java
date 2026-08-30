package com.mcdr.settlement.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
public class Meeting {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) public SettlementRequest request;
 @Column(nullable=false) public LocalDateTime meetingDate;
 public String title;
 public BigDecimal fee;
 @OneToOne(mappedBy="meeting", cascade=CascadeType.ALL, orphanRemoval=true)
 public SettlementDocument settlementDocument;
 public Meeting(){}
 public Meeting(SettlementRequest r,String title,LocalDateTime date){request=r;this.title=title;meetingDate=date;}
}
