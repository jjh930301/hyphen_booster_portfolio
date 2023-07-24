package com.booster.hyphen.nice.repositories;

import org.springframework.stereotype.Repository;

import com.booster.hyphen.nice.entities.Report;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ReportRepository extends JpaRepository<Report , UUID>{
  
}
