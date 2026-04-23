package com.cinematch.repository;

import com.cinematch.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findByMovieId(Long movieId);
    List<Show> findByTheaterId(Long theaterId);
    List<Show> findByStartTimeAfter(LocalDateTime time);
}
