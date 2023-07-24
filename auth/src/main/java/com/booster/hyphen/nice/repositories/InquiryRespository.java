package com.booster.hyphen.nice.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.booster.hyphen.nice.entities.Inquiry;

@Repository
public interface InquiryRespository extends JpaRepository<Inquiry , UUID>{}
