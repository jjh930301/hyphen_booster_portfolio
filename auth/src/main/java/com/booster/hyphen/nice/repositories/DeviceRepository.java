package com.booster.hyphen.nice.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.booster.hyphen.nice.constants.SchemaNames;
import com.booster.hyphen.nice.entities.Device;

@Repository
public interface DeviceRepository extends JpaRepository<Device , UUID>{

  @Query(
    value = "delete from " + SchemaNames.user_devices + " where id = ':id'",
    nativeQuery = true
  )
  void deleteDevice(@Param("id") UUID id);

  @Query(
    value = "SELECT * FROM HYPHEN_BOOSTER.user_devices WHERE id = ':id'",
    nativeQuery = true
  )
  Device findOneById(@Param("id") UUID id);
}
