package com.mcdr.settlement.repo;
import com.mcdr.settlement.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface MeetingRepository extends JpaRepository<Meeting,Long>{
 List<Meeting> findByRequestId(Long requestId);
 Optional<Meeting> findByIdAndRequestId(Long id,Long requestId);
}
