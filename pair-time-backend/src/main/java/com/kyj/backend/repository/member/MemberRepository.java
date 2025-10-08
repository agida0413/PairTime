package com.kyj.backend.repository.member;



import com.kyj.backend.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 2025-10-03
 * @author 김용준
 * JPA 멤버리파지토리
 */
public interface MemberRepository extends JpaRepository<Member,Long>,MemberQueryRepository{
    /**
     * 회원아이디 조회
     * @param username
     * @return
     */
    public Optional<Member> findByUsername(String username);
    public Optional<Member> findByEmail(String email);
}
