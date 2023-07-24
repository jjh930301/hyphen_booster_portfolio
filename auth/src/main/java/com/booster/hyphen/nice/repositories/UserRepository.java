package com.booster.hyphen.nice.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.booster.hyphen.nice.entities.User;
import com.booster.hyphen.nice.entities.User.UserBuilder;

@Repository
public interface UserRepository extends JpaRepository<User , UUID>{

  User save(UserBuilder new_user);

  @EntityGraph(
    attributePaths = {"businesses" , "devices"}
  )
  User findAndJoinById(@Param("id") UUID id);

  @Query(
    value = "SELECT * FROM users WHERE client_id = :client_id",
    nativeQuery = true
  )
  User findOneByCientId(@Param("client_id") String client_id);
}
