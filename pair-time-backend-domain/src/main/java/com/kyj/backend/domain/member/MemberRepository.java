package com.kyj.backend.domain.member;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Member Jpa기본 리파지토리
 */
public interface MemberRepository extends JpaRepository<Member,Long> {
}
