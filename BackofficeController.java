package com.mcdr.settlement.controller;
import com.mcdr.settlement.model.*;
import com.mcdr.settlement.service.BackofficeService;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;
@RestController @RequestMapping("/api/backoffice") @PreAuthorize("hasRole('BACKOFFICE_EMPLOYEE')")
public class BackofficeController {
 private final BackofficeService service;
 public BackofficeController(BackofficeService s){service=s;}
 @GetMapping("/settlements") public Object list(@RequestParam(required=false) RequestStatus status,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return service.list(status,page,size);}
 @GetMapping("/settlements/{id}") public SettlementRequest details(@PathVariable Long id){return service.get(id);}
 @GetMapping("/settlements/{id}/meetings") public Object meetings(@PathVariable Long id){return service.meetings(id);}
 public record FeeRequest(@NotNull @DecimalMin("0.0") BigDecimal fee){}
 @PatchMapping("/settlements/{rid}/meetings/{mid}/fee") public Meeting fee(@PathVariable Long rid,@PathVariable Long mid,@RequestBody FeeRequest body){return service.setFee(rid,mid,body.fee());}
 @PostMapping("/settlements/{id}/approve") public SettlementRequest approve(@PathVariable Long id){return service.approve(id);}
 public record RejectRequest(@NotBlank String reason){}
 @PostMapping("/settlements/{id}/reject") public SettlementRequest reject(@PathVariable Long id,@RequestBody RejectRequest body){return service.reject(id,body.reason());}
 @PostMapping(value="/settlements/{rid}/meetings/{mid}/settlement-document",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 public SettlementDocument upload(@PathVariable Long rid,@PathVariable Long mid,@RequestPart("file") MultipartFile file,Principal p)throws Exception{return service.upload(rid,mid,file,p.getName());}
 @PostMapping("/settlements/{id}/settle") public SettlementRequest settle(@PathVariable Long id){return service.settle(id);}
}
