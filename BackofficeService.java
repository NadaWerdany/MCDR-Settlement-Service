package com.mcdr.settlement.service;
import com.mcdr.settlement.model.*;
import com.mcdr.settlement.repo.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
@Service
public class BackofficeService {
 private final SettlementRequestRepository requests; private final MeetingRepository meetings; private final NotificationService notifications;
 private final Path storage=Paths.get("uploads/settlements");
 public BackofficeService(SettlementRequestRepository r,MeetingRepository m,NotificationService n){requests=r;meetings=m;notifications=n;}
 public Page<SettlementRequest> list(RequestStatus status,int page,int size){
  if(page<0) throw new IllegalArgumentException("page must be >= 0");
  if(size<1 || size>100) throw new IllegalArgumentException("size must be between 1 and 100");
  Pageable p=PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt"));
  return status==null?requests.findAll(p):requests.findByStatus(status,p);
 }
 public SettlementRequest get(Long id){return requests.findDetailedById(id).orElseThrow(()->new NoSuchElementException("Settlement request not found"));}
 public List<Meeting> meetings(Long id){ get(id); return meetings.findByRequestId(id); }
 @Transactional public Meeting setFee(Long rid,Long mid,BigDecimal fee){
  if(fee==null || fee.signum()<0) throw new IllegalArgumentException("fee must be >= 0");
  SettlementRequest r=get(rid); guard(r,RequestStatus.WAITING_FOR_REVIEW);
  Meeting m=meetings.findByIdAndRequestId(mid,rid).orElseThrow(()->new NoSuchElementException("Meeting not found"));
  m.fee=fee; recalc(r); return m;
 }
 @Transactional public SettlementRequest approve(Long id){
  SettlementRequest r=get(id); guard(r,RequestStatus.WAITING_FOR_REVIEW);
  if(r.meetings.isEmpty()) throw new IllegalStateException("Request must have meetings");
  for(Meeting m:r.meetings) if(m.fee==null) throw new IllegalStateException("All meetings must have fees");
  recalc(r); r.status=RequestStatus.APPROVED; requests.save(r);
  notifications.notifyOwner(r,"APPROVED","Settlement approved","Your settlement request has been approved and is ready for payment.");
  return r;
 }
 @Transactional public SettlementRequest reject(Long id,String reason){
  SettlementRequest r=get(id); guard(r,RequestStatus.WAITING_FOR_REVIEW);
  if(reason==null||reason.isBlank()) throw new IllegalArgumentException("rejection reason is required");
  r.rejectionReason=reason; r.status=RequestStatus.REJECTED; requests.save(r);
  notifications.notifyOwner(r,"REJECTED","Settlement rejected",reason); return r;
 }
 @Transactional public SettlementDocument upload(Long rid,Long mid,MultipartFile file,String user)throws IOException{
  SettlementRequest r=get(rid); if(r.status!=RequestStatus.PAID) throw new IllegalStateException("Request must be PAID");
  Meeting m=meetings.findByIdAndRequestId(mid,rid).orElseThrow(()->new NoSuchElementException("Meeting not found"));
  if(file==null||file.isEmpty()) throw new IllegalArgumentException("File is required");
  if(file.getSize()>10*1024*1024) throw new IllegalArgumentException("File exceeds 10MB");
  String ct=file.getContentType()==null?"":file.getContentType().toLowerCase();
  Set<String> allowed=Set.of("application/pdf","image/png","image/jpeg");
  if(!allowed.contains(ct)) throw new IllegalArgumentException("Only PDF, PNG and JPEG files are allowed");
  Files.createDirectories(storage);
  String key=UUID.randomUUID().toString()+"_"+safe(file.getOriginalFilename());
  Files.copy(file.getInputStream(),storage.resolve(key),StandardCopyOption.REPLACE_EXISTING);
  SettlementDocument d=new SettlementDocument(); d.meeting=m; d.originalFilename=safe(file.getOriginalFilename()); d.contentType=ct; d.size=file.getSize(); d.storageKey=key; d.uploadedBy=user; d.uploadedAt=Instant.now();
  m.settlementDocument=d; meetings.save(m); return d;
 }
 @Transactional public SettlementRequest settle(Long id){
  SettlementRequest r=get(id); guard(r,RequestStatus.PAID);
  if(r.meetings.isEmpty()) throw new IllegalStateException("Cannot settle without meetings");
  for(Meeting m:r.meetings) if(m.settlementDocument==null) throw new IllegalStateException("All meetings must have settlement documents");
  r.status=RequestStatus.SETTLED; requests.save(r);
  notifications.notifyOwner(r,"SETTLED","Settlement completed","All settlement documents were completed successfully.");
  return r;
 }
 private void recalc(SettlementRequest r){r.totalFee=r.meetings.stream().map(m->m.fee==null?BigDecimal.ZERO:m.fee).reduce(BigDecimal.ZERO,BigDecimal::add);}
 private void guard(SettlementRequest r,RequestStatus expected){if(r.status!=expected) throw new IllegalStateException("Invalid status transition from "+r.status);}
 private String safe(String s){return s==null?"file":s.replaceAll("[^a-zA-Z0-9._-]","_");}
}
