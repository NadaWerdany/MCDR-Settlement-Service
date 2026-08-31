package com.mcdr.settlement.config;
import com.mcdr.settlement.model.*;
import com.mcdr.settlement.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import java.math.BigDecimal;
import java.time.*;
@Configuration
public class DataInitializer {
 @Bean CommandLineRunner init(SettlementRequestRepository rr,MeetingRepository mr){
  return args->{
   if(rr.count()>0)return;
   SettlementRequest a=new SettlementRequest("CRN-1001",new BigDecimal("500000"),RequestStatus.WAITING_FOR_REVIEW);
   rr.save(a); Meeting a1=new Meeting(a,"Board Meeting",LocalDateTime.now().plusDays(2)); Meeting a2=new Meeting(a,"Review Meeting",LocalDateTime.now().plusDays(4)); mr.save(a1);mr.save(a2);
   SettlementRequest b=new SettlementRequest("CRN-1002",new BigDecimal("750000"),RequestStatus.PAID); rr.save(b);
   Meeting b1=new Meeting(b,"Meeting A",LocalDateTime.now().minusDays(2));b1.fee=new BigDecimal("1000");Meeting b2=new Meeting(b,"Meeting B",LocalDateTime.now().minusDays(1));b2.fee=new BigDecimal("1500");mr.save(b1);mr.save(b2);
  };
 }
}
