package com.booster.hyphen.nice.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.booster.hyphen.nice.entities.Business;

@Repository
public interface BusinessRepository extends JpaRepository<Business , UUID>{
  
}
