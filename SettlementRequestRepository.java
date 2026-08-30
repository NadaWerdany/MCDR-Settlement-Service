package com.mcdr.settlement.repo;
import com.mcdr.settlement.model.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
public interface SettlementRequestRepository extends JpaRepository<SettlementRequest,Long>{
 Page<SettlementRequest> findByStatus(RequestStatus status, Pageable pageable);
 @Query("select distinct r from SettlementRequest r left join fetch r.meetings where r.id=:id")
 java.util.Optional<SettlementRequest> findDetailedById(Long id);
}
