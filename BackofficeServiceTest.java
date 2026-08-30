package com.mcdr.settlement;
import com.mcdr.settlement.model.*;
import com.mcdr.settlement.repo.*;
import com.mcdr.settlement.service.*;
import org.junit.jupiter.api.*;
import org.mockito.*;
import java.math.BigDecimal;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class BackofficeServiceTest {
 @Mock SettlementRequestRepository rr; @Mock MeetingRepository mr; @Mock NotificationService ns;
 BackofficeService s;
 @BeforeEach void setup(){MockitoAnnotations.openMocks(this);s=new BackofficeService(rr,mr,ns);}
 @Test void negativeFeeRejected(){assertThrows(IllegalArgumentException.class,()->s.setFee(1L,1L,BigDecimal.ONE.negate()));}
 @Test void rejectRequiresReason(){
  SettlementRequest r=new SettlementRequest("CRN",BigDecimal.ONE,RequestStatus.WAITING_FOR_REVIEW);r.id=1L;
  when(rr.findDetailedById(1L)).thenReturn(java.util.Optional.of(r));
  assertThrows(IllegalArgumentException.class,()->s.reject(1L," "));
 }
 @Test void approvalRequiresFees(){
  SettlementRequest r=new SettlementRequest("CRN",BigDecimal.ONE,RequestStatus.WAITING_FOR_REVIEW);r.id=1L;
  Meeting m=new Meeting(r,"M",java.time.LocalDateTime.now());r.meetings.add(m);
  when(rr.findDetailedById(1L)).thenReturn(java.util.Optional.of(r));
  assertThrows(IllegalStateException.class,()->s.approve(1L));
 }
 @Test void settledRequiresPaid(){
  SettlementRequest r=new SettlementRequest("CRN",BigDecimal.ONE,RequestStatus.APPROVED);r.id=1L;
  when(rr.findDetailedById(1L)).thenReturn(java.util.Optional.of(r));
  assertThrows(IllegalStateException.class,()->s.settle(1L));
 }
}
